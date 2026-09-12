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
        self.demo_step_description: str = "Live City Fleet & Urban Intelligence Monitoring"
        self._task: Optional[asyncio.Task] = None

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
        self.demo_step_description = "Starting Guided City Morning Peak Simulation..."

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

            speed_kmh = bus["speed"] or 30.0
            move_step = (speed_kmh / 111000.0) * dt * (0.8 + random.uniform(0.0, 0.4))

            if dist < move_step * 1.5:
                new_lat = target_wp["lat"]
                new_lng = target_wp["lng"]
                new_wp_idx = target_idx
            else:
                new_lat = cur_lat + (dlat / dist) * move_step
                new_lng = cur_lng + (dlng / dist) * move_step
                new_wp_idx = wp_idx

            angle_rad = math.atan2(dlng, dlat)
            heading = (math.degrees(angle_rad) + 360) % 360
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

            await self._check_defect_verification(c, bus_id, new_lat, new_lng)
            await self._update_road_segment_observation(c, new_lat, new_lng, now_str)

        conn.commit()
        conn.close()

        await event_bus.publish("fleet_telemetry", {
            "buses": updated_buses,
            "simElapsedSeconds": self.elapsed_seconds,
            "speedMultiplier": self.speed_multiplier,
            "isDemoMode": self.is_demo_mode,
            "demoStepDescription": self.demo_step_description
        })

    async def _update_road_segment_observation(self, cursor, lat: float, lng: float, now_str: str):
        threshold = 0.015
        cursor.execute("""
        SELECT id, healthScore, condition, observationCount, defectCount, coverageState
        FROM road_segments
        WHERE abs(json_extract(coordinates, '$[0].lat') - ?) < ?
        LIMIT 1
        """, (lat, threshold))
        seg = cursor.fetchone()

        if seg:
            new_obs = seg["observationCount"] + 1
            cur_health = seg["healthScore"]
            cur_defects = seg["defectCount"]

            # Evaluate health score & condition
            if cur_defects >= 3:
                new_cond = "Critical"
                new_health = max(20, cur_health - 2)
            elif cur_defects >= 1:
                new_cond = "Attention"
                new_health = max(50, cur_health - 1)
            else:
                new_cond = "Healthy"
                new_health = min(99, cur_health + 1)

            cursor.execute("""
            UPDATE road_segments
            SET observationCount = ?, lastObservedAt = ?, healthScore = ?, condition = ?, coverageState = 'RECENTLY_OBSERVED'
            WHERE id = ?
            """, (new_obs, now_str, new_health, new_cond, seg["id"]))

    async def _check_defect_verification(self, cursor, bus_id: str, bus_lat: float, bus_lng: float):
        threshold = 0.00045
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
        Complete 19-scene Guided Interactive Demo for SIH 2026 Presentation.
        Executes end-to-end closed loop workflow.
        """
        t = self.elapsed_seconds
        step_interval = 12  # seconds per scene

        step_num = int(t / step_interval) + 1

        if step_num > 19:
            self.demo_step_description = "Guided City Simulation Complete - System in Active Live Mode"
            return

        if step_num != self.demo_step_index:
            self.demo_step_index = step_num
            
            demo_scenes = [
                (1, "SCENE 1: Public Bus Fleet Active - 30 buses moving along transit corridors"),
                (2, "SCENE 2: Pothole Detected - BUS-004 identifies critical defect on Wakad Ramp (94% conf)"),
                (3, "SCENE 3: Multi-Source Verification - BUS-012 cross-confirms same defect location"),
                (4, "SCENE 4: Live Road Health Update - Segment SEG-003 transitions to RED (Critical)"),
                (5, "SCENE 5: Maintenance Ticket Auto-Generated - Work Order TKT-2026-0842 assigned"),
                (6, "SCENE 6: Citizen Report Ingested - Public submission #UP-2026-000421 received via app"),
                (7, "SCENE 7: Citizen Points Credited - Reporter earns +25 points after AI verification"),
                (8, "SCENE 8: Traffic Congestion Signal - Standstill registered on University Underpass"),
                (9, "SCENE 9: Incident Reported - Road accident logged on Sector 18 Corridor"),
                (10, "SCENE 10: Geospatial Route Matching - BUS-004 & BUS-012 identified in proximity"),
                (11, "SCENE 11: Video Evidence Retrieval - Relevant clips ranked with 96% spatial match"),
                (12, "SCENE 12: ANPR OCR Detection - License plate UP-16-AB-1234 extracted from feed"),
                (13, "SCENE 13: Vehicle of Interest Match - Potential police watchlist match identified"),
                (14, "SCENE 14: Operator Review - ICCC Operator verifies evidence pack and escalates"),
                (15, "SCENE 15: Municipal Repair Simulated - Asphalt repair team completes work order"),
                (16, "SCENE 16: Fleet Re-Observation - BUS-007 passes segment and scans repaired surface"),
                (17, "SCENE 17: Road Segment Recovery - Road condition shifts toward GREEN (Healthy)"),
                (18, "SCENE 18: Repair Verified - Work order closed with AI verification badge"),
                (19, "SCENE 19: Coverage Intelligence - Unobserved gully identified; Survey Mission assigned")
            ]

            curr_scene = demo_scenes[min(step_num - 1, len(demo_scenes) - 1)]
            self.demo_step_description = curr_scene[1]

            await event_bus.publish("demo_step", {
                "step": curr_scene[0],
                "title": f"Scene {curr_scene[0]} / 19",
                "description": curr_scene[1],
                "elapsed": t
            })

            # DB State updates for key demo scenes
            if step_num == 4:
                # Mark SEG-003 as RED
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("UPDATE road_segments SET condition = 'Critical', healthScore = 25, defectCount = 3 WHERE segmentId = 'SEG-003'")
                conn.commit()
                conn.close()
            elif step_num == 7:
                # Award citizen points
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("UPDATE reward_accounts SET points = points + 25 WHERE userId = 'USR-001'")
                conn.commit()
                conn.close()
            elif step_num == 17 or step_num == 18:
                # Recovery to GREEN
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("UPDATE road_segments SET condition = 'Healthy', healthScore = 95, defectCount = 0 WHERE segmentId = 'SEG-003'")
                c.execute("UPDATE maintenance_tickets SET status = 'RE_VERIFIED', resolutionNotes = 'AI verified repair on re-observation' WHERE ticketCode = 'TKT-2026-0842'")
                conn.commit()
                conn.close()

simulation_engine = SimulationEngine()

