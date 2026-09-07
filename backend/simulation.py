import asyncio
import json
import random
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from database import get_db_connection, BASE_ROUTES
from event_bus import event_bus
from inference import active_inference_provider

class SimulationEngine:
    def __init__(self):
        self.is_running: bool = True
        self.speed_multiplier: int = 1
        self.elapsed_seconds: int = 0
        self.is_demo_mode: bool = False
        self.demo_step_index: int = 0
        self.demo_step_description: str = "Live City Fleet Monitoring"
        self._task: Optional[asyncio.Task] = None
        self._demo_task: Optional[asyncio.Task] = None

    def start(self):
        self.is_running = True

    def pause(self):
        self.is_running = False

    def set_speed(self, speed: int):
        if speed in [1, 2, 5, 10]:
            self.speed_multiplier = speed

    def reset(self):
        self.elapsed_seconds = 0
        self.is_demo_mode = False
        self.demo_step_index = 0
        self.demo_step_description = "System Ready"

    def start_scripted_demo(self):
        self.is_running = True
        self.is_demo_mode = True
        self.demo_step_index = 0
        self.elapsed_seconds = 0
        self.demo_step_description = "Starting City Morning Peak Simulation..."

    async def run_loop(self):
        """
        Main simulation loop that ticks every 1 second.
        """
        while True:
            try:
                if self.is_running:
                    step_dt = self.speed_multiplier
                    self.elapsed_seconds += step_dt
                    await self._update_bus_positions(step_dt)
                    
                    if self.is_demo_mode:
                        await self._handle_scripted_demo_step()
                    else:
                        # Periodic spontaneous events during standard simulation
                        if self.elapsed_seconds % max(1, int(15 / self.speed_multiplier)) == 0:
                            await self._generate_spontaneous_event()

                await asyncio.sleep(1.0)
            except Exception as e:
                print(f"[SimulationEngine] Error in loop: {e}")
                await asyncio.sleep(1.0)

    async def _update_bus_positions(self, dt: int):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM buses")
        buses = c.fetchall()

        # Load route waypoints map
        routes_map = {r["id"]: r["waypoints"] for r in BASE_ROUTES}

        updated_buses = []
        for bus in buses:
            bus_id = bus["id"]
            route_id = bus["routeId"]
            wps = routes_map.get(route_id, [])
            if not wps or len(wps) < 2:
                continue

            wp_idx = bus["currentWaypointIndex"] or 0
            direction = bus["direction"] or 1
            cur_lat = bus["latitude"]
            cur_lng = bus["longitude"]

            target_idx = wp_idx + direction
            if target_idx >= len(wps):
                direction = -1
                target_idx = len(wps) - 2
            elif target_idx < 0:
                direction = 1
                target_idx = 1

            target_wp = wps[target_idx]
            dlat = target_wp["lat"] - cur_lat
            dlng = target_wp["lng"] - cur_lng
            dist = math.sqrt(dlat*dlat + dlng*dlng)

            # Move towards target waypoint based on speed
            speed_kmh = bus["speed"] or 30.0
            # Approx degree per second
            move_step = (speed_kmh / 111000.0) * dt * (0.8 + random.uniform(0.0, 0.4))

            if dist < move_step * 1.5:
                # Reached waypoint
                new_lat = target_wp["lat"]
                new_lng = target_wp["lng"]
                new_wp_idx = target_idx
            else:
                new_lat = cur_lat + (dlat / dist) * move_step
                new_lng = cur_lng + (dlng / dist) * move_step
                new_wp_idx = wp_idx

            # Calculate heading in degrees
            angle_rad = math.atan2(dlng, dlat)
            heading = (math.degrees(angle_rad) + 360) % 360

            # Slight speed fluctuation
            new_speed = max(12.0, min(52.0, speed_kmh + random.uniform(-2.0, 2.0)))
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            c.execute("""
            UPDATE buses
            SET latitude = ?, longitude = ?, speed = ?, heading = ?,
                currentWaypointIndex = ?, direction = ?, lastUpdateTime = ?
            WHERE id = ?
            """, (new_lat, new_lng, round(new_speed, 1), round(heading, 1), new_wp_idx, direction, now_str, bus_id))

            updated_buses.append({
                "id": bus_id,
                "fleetNumber": bus["fleetNumber"],
                "routeId": route_id,
                "routeName": bus["routeName"],
                "latitude": round(new_lat, 6),
                "longitude": round(new_lng, 6),
                "speed": round(new_speed, 1),
                "heading": round(heading, 1),
                "status": bus["status"],
                "edgeFps": bus["edgeFps"]
            })

            # Check for Multi-Bus Road Defect Verification
            await self._check_defect_verification(c, bus_id, new_lat, new_lng)

        conn.commit()
        conn.close()

        # Broadcast telemetry batch to websocket subscribers via EventBus
        await event_bus.publish("fleet_telemetry", {
            "buses": updated_buses,
            "simElapsedSeconds": self.elapsed_seconds,
            "speedMultiplier": self.speed_multiplier,
            "isDemoMode": self.is_demo_mode,
            "demoStepDescription": self.demo_step_description
        })

    async def _check_defect_verification(self, cursor, bus_id: str, bus_lat: float, bus_lng: float):
        """
        Multi-bus verification logic:
        If a bus comes within ~35 meters (~0.00035 degrees) of an unverified or reported defect:
        1. Increase timesConfirmed
        2. Increase confidence
        3. Add bus to crossVerifyingBuses
        4. Set status = 'Cross-verified'
        5. Trigger alert
        """
        threshold = 0.00045 # approx 50m in degrees
        cursor.execute("""
        SELECT id, defectType, confidence, timesConfirmed, crossVerifyingBuses, status, address
        FROM road_defects
        WHERE abs(latitude - ?) < ? AND abs(longitude - ?) < ?
        LIMIT 1
        """, (bus_lat, threshold, bus_lng, threshold))
        match = cursor.fetchone()

        if match:
            def_id = match["id"]
            cur_buses = json.loads(match["crossVerifyingBuses"] or "[]")
            if bus_id not in cur_buses:
                cur_buses.append(bus_id)
                new_count = match["timesConfirmed"] + 1
                new_conf = min(0.98, match["confidence"] + 0.06)
                new_status = "Cross-verified"
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute("""
                UPDATE road_defects
                SET timesConfirmed = ?, confidence = ?, crossVerifyingBuses = ?,
                    status = ?, lastSeen = ?
                WHERE id = ?
                """, (new_count, new_conf, json.dumps(cur_buses), new_status, now_str, def_id))

                # Publish cross-verification event!
                await event_bus.publish("defect_verified", {
                    "defectId": def_id,
                    "defectType": match["defectType"],
                    "address": match["address"],
                    "confirmingBusId": bus_id,
                    "totalVerifications": new_count,
                    "crossVerifyingBuses": cur_buses,
                    "newConfidence": new_conf,
                    "status": new_status,
                    "message": f"Multi-Bus Verification: {bus_id} confirmed {match['defectType']} at {match['address']}"
                })

    async def _generate_spontaneous_event(self):
        """
        Generates realistic ambient events while standard simulation is active.
        """
        event_types = ["defect", "traffic", "safety"]
        chosen = random.choice(event_types)
        conn = get_db_connection()
        c = conn.cursor()

        if chosen == "defect":
            c.execute("SELECT * FROM road_defects ORDER BY RANDOM() LIMIT 1")
            d = c.fetchone()
            if d:
                await event_bus.publish("ambient_defect_detected", {
                    "id": d["id"],
                    "defectType": d["defectType"],
                    "severity": d["severity"],
                    "confidence": d["confidence"],
                    "address": d["address"],
                    "busId": d["detectedByBusId"]
                })
        elif chosen == "traffic":
            c.execute("SELECT * FROM traffic_events ORDER BY RANDOM() LIMIT 1")
            t = c.fetchone()
            if t:
                await event_bus.publish("ambient_traffic_update", {
                    "corridor": t["corridorName"],
                    "congestion": t["congestionLevel"],
                    "avgSpeed": t["averageSpeedKmH"],
                    "delayMinutes": t["delayMinutes"]
                })

        conn.close()

    async def _handle_scripted_demo_step(self):
        """
        Scripted Scenario: "City Morning Peak Simulation"
        Executes exact milestones from user spec:
        0:00 - Start
        0:20 - Multiple buses moving
        0:40 - Bus detects Pothole (Confidence: 94%, Severity: High)
        1:00 - Event appears on map
        1:20 - Second bus cross-verifies same pothole
        1:40 - Create maintenance ticket
        2:00 - Traffic congestion appears
        2:20 - Traffic heatmap
        2:40 - Bus detects risky pedestrian event
        3:00 - Incident detail
        3:20 - Rash-driving / hit-and-run event
        3:40 - Vehicle tracking + Demo ANPR/OCR
        4:00 - Event video reference
        4:30 - ICCC command-center view
        5:00 - Analytics summary & wrap-up
        """
        t = self.elapsed_seconds

        if t >= 0 and self.demo_step_index == 0:
            self.demo_step_index = 1
            self.demo_step_description = "Step 1/12: System Dashboard Initialized - Real-Time Fleet Ingestion Active"
            await event_bus.publish("demo_step", {
                "step": 1,
                "title": "System Initialized",
                "description": "32 mobile public buses operating as urban sensing nodes across Smart City corridors.",
                "elapsed": t
            })

        elif t >= 20 and self.demo_step_index == 1:
            self.demo_step_index = 2
            self.demo_step_description = "Step 2/12: Fleet In Motion - Edge Perception Active on 32 Transit Buses"
            await event_bus.publish("demo_step", {
                "step": 2,
                "title": "Fleet In Motion",
                "description": "Front, rear, and side camera video streams processed in real-time on edge compute.",
                "elapsed": t
            })

        elif t >= 40 and self.demo_step_index == 2:
            self.demo_step_index = 3
            self.demo_step_description = "Step 3/12: POTHOLE DETECTED - BUS-004 on Wakad Flyover Ramp (Conf: 94%, Sev: High)"
            await event_bus.publish("demo_pothole_detected", {
                "step": 3,
                "busId": "BUS-004",
                "defectType": "Pothole",
                "severity": "High",
                "confidence": 0.94,
                "address": "Wakad Flyover Ramp, Hinjawadi Spine",
                "dimensions": "48cm x 35cm, 7.5cm depth",
                "evidenceUrl": "/evidence/road_defect_1.jpg",
                "lat": 18.5985,
                "lng": 73.7621
            })

        elif t >= 60 and self.demo_step_index == 3:
            self.demo_step_index = 4
            self.demo_step_description = "Step 4/12: Event Geotagged on Central GIS Map"
            await event_bus.publish("demo_step", {
                "step": 4,
                "title": "GIS Marker Created",
                "description": "Spatial metadata transmitted without sending heavy raw video feed.",
                "elapsed": t
            })

        elif t >= 80 and self.demo_step_index == 4:
            self.demo_step_index = 5
            self.demo_step_description = "Step 5/12: MULTI-BUS CROSS-VERIFIED! BUS-012 Confirms Defect (Confidence 98%)"
            await event_bus.publish("demo_defect_cross_verified", {
                "step": 5,
                "defectId": "DEF-0001",
                "defectType": "Pothole",
                "address": "Wakad Flyover Ramp",
                "initialBus": "BUS-004",
                "verifyingBus": "BUS-012",
                "timesConfirmed": 2,
                "newConfidence": 0.98,
                "status": "Cross-verified",
                "badge": "High-confidence recurring road defect"
            })

        elif t >= 100 and self.demo_step_index == 5:
            self.demo_step_index = 6
            self.demo_step_description = "Step 6/12: Auto-Created Maintenance Ticket TKT-2026-0842 (Priority P1)"
            await event_bus.publish("demo_ticket_created", {
                "step": 6,
                "ticketCode": "TKT-2026-0842",
                "priority": "P1",
                "defectType": "Pothole",
                "assignedContractor": "PMC Road Works & Asphalt Division",
                "slaTarget": "Within 48 Hours"
            })

        elif t >= 120 and self.demo_step_index == 6:
            self.demo_step_index = 7
            self.demo_step_description = "Step 7/12: Traffic Congestion Detected - Pune University Grade Separator"
            await event_bus.publish("demo_traffic_congestion", {
                "step": 7,
                "corridor": "Pune University Grade Separator",
                "congestionLevel": "Heavy",
                "averageSpeed": "14.2 km/h",
                "delayEstimate": "+14.8 min delay",
                "affectedBuses": ["BUS-001", "BUS-005", "BUS-018"]
            })

        elif t >= 140 and self.demo_step_index == 7:
            self.demo_step_index = 8
            self.demo_step_description = "Step 8/12: Dynamic Traffic Heatmap & Corridor Congestion Analytics Active"
            await event_bus.publish("demo_step", {
                "step": 8,
                "title": "Traffic Heatmap Rendered",
                "description": "Aggregated vehicular counts from 32 buses generate real-time road density heatmaps.",
                "elapsed": t
            })

        elif t >= 160 and self.demo_step_index == 8:
            self.demo_step_index = 9
            self.demo_step_description = "Step 9/12: SAFETY ALERT - Risky Pedestrian Proximity Detected by BUS-007"
            await event_bus.publish("demo_safety_incident", {
                "step": 9,
                "incidentType": "Dangerous Pedestrian Proximity",
                "severity": "High",
                "busId": "BUS-007",
                "location": "Swargate Multimodal Bus Terminal Junction",
                "confidence": 0.93,
                "details": "Pedestrian crossed within 1.8m blind spot; automated collision warning alerted driver."
            })

        elif t >= 180 and self.demo_step_index == 9:
            self.demo_step_index = 10
            self.demo_step_description = "Step 10/12: Rash-Driving Event - Vehicle Tracking & Demo ANPR OCR"
            await event_bus.publish("demo_anpr_enforcement", {
                "step": 10,
                "incidentType": "Rash Driving / BRTS Lane Intrusion",
                "severity": "Critical",
                "trackedVehicle": "Black Sedan (MH-12-KQ-7722)",
                "anprPlate": "MH-12-KQ-7722",
                "ocrConfidence": 0.96,
                "speedRecorded": "68 km/h in 30 km/h transit lane",
                "videoRef": "/evidence/clip_event_1.mp4",
                "evidenceUrl": "/evidence/incident_frame_1.jpg"
            })

        elif t >= 220 and self.demo_step_index == 10:
            self.demo_step_index = 11
            self.demo_step_description = "Step 11/12: Municipal ICCC Command Center View - Inter-Departmental Triage"
            await event_bus.publish("demo_step", {
                "step": 11,
                "title": "ICCC Triage Action",
                "description": "Road engineers, traffic controllers, and fleet admins collaborate on single platform.",
                "elapsed": t
            })

        elif t >= 260 and self.demo_step_index == 11:
            self.demo_step_index = 12
            self.demo_step_description = "Step 12/12: Complete: Observe → Detect → Verify → Prioritize → Act"
            await event_bus.publish("demo_complete", {
                "step": 12,
                "title": "Demo Scenario Complete",
                "summary": "UrbanPulse AI successfully turned public buses into mobile sensing nodes for road, traffic, safety, and enforcement.",
                "coreMotto": "Observe → Detect → Verify → Prioritize → Act"
            })

simulation_engine = SimulationEngine()
