import os
import json
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from database import init_db, get_db_connection
from models import (
    Bus, Route, RoadDefect, TrafficEvent, SafetyIncident,
    ANPRDetection, MaintenanceTicket, SystemHealth, SimulationStatus, OverviewKPIs
)
from event_bus import event_bus
from simulation import simulation_engine
from inference import active_inference_provider

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB on start if not already created
    if not os.path.exists("urbanpulse.db"):
        init_db()
    else:
        # Re-initialize to ensure fresh clean state for hackathon demo
        init_db()
    
    # Start simulation loop in background
    sim_task = asyncio.create_task(simulation_engine.run_loop())
    yield
    sim_task.cancel()

app = FastAPI(
    title="UrbanPulse AI - Mobile Urban Intelligence Platform",
    description="Smart India Hackathon 2026 (Problem Statement ID: 26124)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_websockets: List[WebSocket] = []

async def broadcast_ws_message(event_data: Dict[str, Any]):
    dead_sockets = []
    message_str = json.dumps(event_data)
    for ws in active_websockets:
        try:
            await ws.send_text(message_str)
        except Exception:
            dead_sockets.append(ws)
    for ws in dead_sockets:
        if ws in active_websockets:
            active_websockets.remove(ws)

# Register WebSocket broadcaster with EventBus
event_bus.subscribe(broadcast_ws_message)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    # Send immediate handshake and status
    try:
        await websocket.send_text(json.dumps({
            "topic": "connection_ack",
            "message": "Connected to UrbanPulse AI ICCC Streaming Gateway",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "busesActive": 32,
                "simulationRunning": simulation_engine.is_running,
                "speedMultiplier": simulation_engine.speed_multiplier
            }
        }))
        while True:
            # Keep receiving client messages (e.g. ping or commands)
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "ping":
                    await websocket.send_text(json.dumps({"topic": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
    except Exception:
        if websocket in active_websockets:
            active_websockets.remove(websocket)

# ================= REST ENDPOINTS =================

@app.get("/api/overview", response_model=OverviewKPIs)
def get_overview():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM buses WHERE status = 'Active'")
    active_buses = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM road_defects")
    total_defects = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM safety_incidents WHERE severity = 'Critical'")
    critical_incidents = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM traffic_events WHERE congestionLevel IN ('Heavy', 'Standstill')")
    congestion_hotspots = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM maintenance_tickets WHERE status != 'Resolved'")
    open_tickets = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM road_defects WHERE status = 'Cross-verified'")
    verified_count = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM safety_incidents")
    safety_today = c.fetchone()[0]

    conn.close()
    return OverviewKPIs(
        activeBuses=active_buses,
        totalRoadIssues=total_defects,
        criticalIncidents=critical_incidents,
        congestionHotspots=congestion_hotspots,
        openMaintenanceTickets=open_tickets,
        roadCoveragePercent=74.8,
        multiBusVerifiedCount=verified_count,
        safetyAlertsToday=safety_today
    )

@app.get("/api/buses", response_model=List[Bus])
def get_buses(status: Optional[str] = None):
    conn = get_db_connection()
    c = conn.cursor()
    if status:
        c.execute("SELECT * FROM buses WHERE status = ?", (status,))
    else:
        c.execute("SELECT * FROM buses")
    rows = c.fetchall()
    conn.close()

    buses = []
    for r in rows:
        buses.append(Bus(
            id=r["id"],
            fleetNumber=r["fleetNumber"],
            routeId=r["routeId"],
            routeName=r["routeName"],
            status=r["status"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            speed=r["speed"],
            heading=r["heading"],
            cameraHealth=r["cameraHealth"],
            gpsHealth=r["gpsHealth"],
            networkStatus=r["networkStatus"],
            edgeFps=r["edgeFps"],
            gpuUtilization=r["gpuUtilization"],
            lastEvent=r["lastEvent"],
            lastUpdateTime=r["lastUpdateTime"],
            currentPassengerLoad=r["currentPassengerLoad"],
            cameras=json.loads(r["cameras"] or "[]")
        ))
    return buses

@app.get("/api/buses/{bus_id}", response_model=Bus)
def get_bus(bus_id: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM buses WHERE id = ?", (bus_id,))
    r = c.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Bus not found")
    return Bus(
        id=r["id"],
        fleetNumber=r["fleetNumber"],
        routeId=r["routeId"],
        routeName=r["routeName"],
        status=r["status"],
        latitude=r["latitude"],
        longitude=r["longitude"],
        speed=r["speed"],
        heading=r["heading"],
        cameraHealth=r["cameraHealth"],
        gpsHealth=r["gpsHealth"],
        networkStatus=r["networkStatus"],
        edgeFps=r["edgeFps"],
        gpuUtilization=r["gpuUtilization"],
        lastEvent=r["lastEvent"],
        lastUpdateTime=r["lastUpdateTime"],
        currentPassengerLoad=r["currentPassengerLoad"],
        cameras=json.loads(r["cameras"] or "[]")
    )

@app.get("/api/routes", response_model=List[Route])
def get_routes():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM routes")
    rows = c.fetchall()
    conn.close()

    routes = []
    for r in rows:
        routes.append(Route(
            id=r["id"],
            name=r["name"],
            corridor=r["corridor"],
            totalDistanceKm=r["totalDistanceKm"],
            activeBusesCount=r["activeBusesCount"],
            avgSpeedKmH=r["avgSpeedKmH"],
            congestionLevel=r["congestionLevel"],
            waypoints=json.loads(r["waypoints"] or "[]")
        ))
    return routes

@app.get("/api/road-defects", response_model=List[RoadDefect])
def get_road_defects(
    defectType: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None
):
    conn = get_db_connection()
    c = conn.cursor()
    query = "SELECT * FROM road_defects WHERE 1=1"
    params = []
    if defectType:
        query += " AND defectType = ?"
        params.append(defectType)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY lastSeen DESC"

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    defects = []
    for r in rows:
        defects.append(RoadDefect(
            id=r["id"],
            defectType=r["defectType"],
            severity=r["severity"],
            confidence=r["confidence"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            routeId=r["routeId"],
            detectedByBusId=r["detectedByBusId"],
            firstSeen=r["firstSeen"],
            lastSeen=r["lastSeen"],
            timesConfirmed=r["timesConfirmed"],
            status=r["status"],
            priority=r["priority"],
            evidenceImageUrl=r["evidenceImageUrl"],
            dimensionsEstimated=r["dimensionsEstimated"],
            crossVerifyingBuses=json.loads(r["crossVerifyingBuses"] or "[]")
        ))
    return defects

@app.get("/api/road-defects/{defect_id}", response_model=RoadDefect)
def get_road_defect(defect_id: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM road_defects WHERE id = ?", (defect_id,))
    r = c.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Road defect not found")
    return RoadDefect(
        id=r["id"],
        defectType=r["defectType"],
        severity=r["severity"],
        confidence=r["confidence"],
        latitude=r["latitude"],
        longitude=r["longitude"],
        address=r["address"],
        routeId=r["routeId"],
        detectedByBusId=r["detectedByBusId"],
        firstSeen=r["firstSeen"],
        lastSeen=r["lastSeen"],
        timesConfirmed=r["timesConfirmed"],
        status=r["status"],
        priority=r["priority"],
        evidenceImageUrl=r["evidenceImageUrl"],
        dimensionsEstimated=r["dimensionsEstimated"],
        crossVerifyingBuses=json.loads(r["crossVerifyingBuses"] or "[]")
    )

@app.get("/api/traffic", response_model=List[TrafficEvent])
def get_traffic_events():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM traffic_events ORDER BY densityScore DESC")
    rows = c.fetchall()
    conn.close()

    events = []
    for r in rows:
        events.append(TrafficEvent(
            id=r["id"],
            corridorName=r["corridorName"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            congestionLevel=r["congestionLevel"],
            averageSpeedKmH=r["averageSpeedKmH"],
            freeFlowSpeedKmH=r["freeFlowSpeedKmH"],
            delayMinutes=r["delayMinutes"],
            affectedVehiclesEstimate=r["affectedVehiclesEstimate"],
            observedByBusId=r["observedByBusId"],
            timestamp=r["timestamp"],
            densityScore=r["densityScore"]
        ))
    return events

@app.get("/api/incidents", response_model=List[SafetyIncident])
def get_safety_incidents():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM safety_incidents ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()

    incidents = []
    for r in rows:
        anpr_data = json.loads(r["anprInfo"] or "null")
        anpr_obj = None
        if anpr_data:
            anpr_obj = ANPRDetection(
                id=f"ANPR-{r['id']}",
                plateNumber=anpr_data.get("plateNumber", "MH-12-XX-0000"),
                vehicleType=anpr_data.get("vehicleType", "Vehicle"),
                confidence=anpr_data.get("confidence", 0.92),
                color="Detected",
                speedEstimated=45.0,
                latitude=r["latitude"],
                longitude=r["longitude"],
                timestamp=r["timestamp"],
                busId=r["busId"],
                flaggedReason="Incident Correlation",
                demoOcrCropUrl=anpr_data.get("demoOcrCropUrl")
            )

        incidents.append(SafetyIncident(
            id=r["id"],
            incidentType=r["incidentType"],
            severity=r["severity"],
            confidence=r["confidence"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            timestamp=r["timestamp"],
            busId=r["busId"],
            routeId=r["routeId"],
            status=r["status"],
            trackedObject=r["trackedObject"],
            eventDescription=r["eventDescription"],
            videoRefUrl=r["videoRefUrl"],
            evidenceImageUrl=r["evidenceImageUrl"],
            anprInfo=anpr_obj,
            actionTaken=r["actionTaken"]
        ))
    return incidents

@app.get("/api/incidents/{incident_id}", response_model=SafetyIncident)
def get_incident(incident_id: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM safety_incidents WHERE id = ?", (incident_id,))
    r = c.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Incident not found")
    anpr_data = json.loads(r["anprInfo"] or "null")
    anpr_obj = None
    if anpr_data:
        anpr_obj = ANPRDetection(
            id=f"ANPR-{r['id']}",
            plateNumber=anpr_data.get("plateNumber", "MH-12-XX-0000"),
            vehicleType=anpr_data.get("vehicleType", "Vehicle"),
            confidence=anpr_data.get("confidence", 0.92),
            color="Detected",
            speedEstimated=45.0,
            latitude=r["latitude"],
            longitude=r["longitude"],
            timestamp=r["timestamp"],
            busId=r["busId"],
            flaggedReason="Incident Correlation",
            demoOcrCropUrl=anpr_data.get("demoOcrCropUrl")
        )
    return SafetyIncident(
        id=r["id"],
        incidentType=r["incidentType"],
        severity=r["severity"],
        confidence=r["confidence"],
        latitude=r["latitude"],
        longitude=r["longitude"],
        address=r["address"],
        timestamp=r["timestamp"],
        busId=r["busId"],
        routeId=r["routeId"],
        status=r["status"],
        trackedObject=r["trackedObject"],
        eventDescription=r["eventDescription"],
        videoRefUrl=r["videoRefUrl"],
        evidenceImageUrl=r["evidenceImageUrl"],
        anprInfo=anpr_obj,
        actionTaken=r["actionTaken"]
    )

@app.get("/api/anpr", response_model=List[ANPRDetection])
def get_anpr_detections():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM anpr_detections ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append(ANPRDetection(
            id=r["id"],
            plateNumber=r["plateNumber"],
            vehicleType=r["vehicleType"],
            confidence=r["confidence"],
            color=r["color"],
            speedEstimated=r["speedEstimated"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            timestamp=r["timestamp"],
            busId=r["busId"],
            flaggedReason=r["flaggedReason"],
            demoOcrCropUrl=r["demoOcrCropUrl"]
        ))
    return results

@app.get("/api/maintenance", response_model=List[MaintenanceTicket])
def get_maintenance_tickets():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM maintenance_tickets ORDER BY priority ASC, reportedAt DESC")
    rows = c.fetchall()
    conn.close()

    tickets = []
    for r in rows:
        tickets.append(MaintenanceTicket(
            id=r["id"],
            ticketCode=r["ticketCode"],
            defectId=r["defectId"],
            defectType=r["defectType"],
            priority=r["priority"],
            severity=r["severity"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            reportedAt=r["reportedAt"],
            targetResolutionDate=r["targetResolutionDate"],
            status=r["status"],
            assignedContractor=r["assignedContractor"],
            confirmingBusesCount=r["confirmingBusesCount"],
            estimatedCostInr=r["estimatedCostInr"],
            evidenceImageUrl=r["evidenceImageUrl"],
            resolutionNotes=r["resolutionNotes"]
        ))
    return tickets

@app.post("/api/maintenance", response_model=MaintenanceTicket, status_code=status.HTTP_201_CREATED)
async def create_maintenance_ticket(ticket_data: Dict[str, Any]):
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) FROM maintenance_tickets")
    next_idx = c.fetchone()[0] + 1
    new_id = f"MNT-{next_idx:04d}"
    ticket_code = f"TKT-2026-{2000 + next_idx}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    defect_id = ticket_data.get("defectId", "DEF-CUSTOM")
    defect_type = ticket_data.get("defectType", "Pothole")
    severity = ticket_data.get("severity", "High")
    priority = "P1" if severity == "Critical" else ("P2" if severity == "High" else "P3")
    lat = float(ticket_data.get("latitude", 18.5204))
    lng = float(ticket_data.get("longitude", 73.8567))
    address = ticket_data.get("address", "Smart City Municipal Corridor")
    assigned = ticket_data.get("assignedContractor", "Pune Smart Infra Road Works")
    confirming = int(ticket_data.get("confirmingBusesCount", 2))
    cost = int(ticket_data.get("estimatedCostInr", 45000))
    evidence = ticket_data.get("evidenceImageUrl", "/evidence/road_defect_1.jpg")

    c.execute("""
    INSERT INTO maintenance_tickets (
        id, ticketCode, defectId, defectType, priority, severity, latitude, longitude,
        address, reportedAt, targetResolutionDate, status, assignedContractor,
        confirmingBusesCount, estimatedCostInr, evidenceImageUrl, resolutionNotes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, ticket_code, defect_id, defect_type, priority, severity, lat, lng,
        address, now_str, "Within 48 Hours", "Open", assigned, confirming, cost,
        evidence, "Auto-generated from Multi-Bus Verification"
    ))

    # Also update defect status if exists
    c.execute("UPDATE road_defects SET status = 'Ticket Created' WHERE id = ?", (defect_id,))

    conn.commit()
    conn.close()

    new_ticket = MaintenanceTicket(
        id=new_id,
        ticketCode=ticket_code,
        defectId=defect_id,
        defectType=defect_type,
        priority=priority,
        severity=severity,
        latitude=lat,
        longitude=lng,
        address=address,
        reportedAt=now_str,
        targetResolutionDate="Within 48 Hours",
        status="Open",
        assignedContractor=assigned,
        confirmingBusesCount=confirming,
        estimatedCostInr=cost,
        evidenceImageUrl=evidence,
        resolutionNotes="Auto-generated from Multi-Bus Verification"
    )

    # Publish notification
    await event_bus.publish("ticket_created", new_ticket.model_dump())
    return new_ticket

@app.patch("/api/maintenance/{ticket_id}")
async def update_ticket_status(ticket_id: str, payload: Dict[str, Any]):
    conn = get_db_connection()
    c = conn.cursor()
    new_status = payload.get("status")
    notes = payload.get("resolutionNotes")

    if new_status:
        c.execute("UPDATE maintenance_tickets SET status = ? WHERE id = ? OR ticketCode = ?", (new_status, ticket_id, ticket_id))
    if notes:
        c.execute("UPDATE maintenance_tickets SET resolutionNotes = ? WHERE id = ? OR ticketCode = ?", (notes, ticket_id, ticket_id))
    conn.commit()
    conn.close()

    await event_bus.publish("ticket_updated", {"ticketId": ticket_id, "status": new_status, "notes": notes})
    return {"message": "Ticket updated successfully", "ticketId": ticket_id, "status": new_status}

@app.get("/api/system-health", response_model=SystemHealth)
def get_system_health():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM system_health LIMIT 1")
    r = c.fetchone()
    conn.close()
    if not r:
        return SystemHealth(
            activeBusesTotal=32,
            onlineBusesCount=30,
            cameraHealthPercent=98.5,
            gpsHealthPercent=99.2,
            avgEdgeInferenceFps=29.4,
            queueDepth=3,
            apiLatencyMs=18.4,
            ingestionRateEventsPerSec=42.1,
            dbHealthStatus="Operational",
            cloudSyncStatus="Synchronized",
            simulatedAt=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
    return SystemHealth(
        activeBusesTotal=r["activeBusesTotal"],
        onlineBusesCount=r["onlineBusesCount"],
        cameraHealthPercent=r["cameraHealthPercent"],
        gpsHealthPercent=r["gpsHealthPercent"],
        avgEdgeInferenceFps=r["avgEdgeInferenceFps"],
        queueDepth=r["queueDepth"],
        apiLatencyMs=r["apiLatencyMs"],
        ingestionRateEventsPerSec=r["ingestionRateEventsPerSec"],
        dbHealthStatus=r["dbHealthStatus"],
        cloudSyncStatus=r["cloudSyncStatus"],
        simulatedAt=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

# Simulation Controls
@app.get("/api/simulation/status", response_model=SimulationStatus)
def get_simulation_status():
    return SimulationStatus(
        isRunning=simulation_engine.is_running,
        speed=simulation_engine.speed_multiplier,
        elapsedSeconds=simulation_engine.elapsed_seconds,
        isDemoMode=simulation_engine.is_demo_mode,
        demoStepIndex=simulation_engine.demo_step_index,
        demoStepDescription=simulation_engine.demo_step_description,
        activeBuses=32,
        totalEventsGenerated=event_bus.total_dispatched
    )

@app.post("/api/simulation/start")
def start_simulation():
    simulation_engine.start()
    return {"status": "started", "isRunning": True}

@app.post("/api/simulation/pause")
def pause_simulation():
    simulation_engine.pause()
    return {"status": "paused", "isRunning": False}

@app.post("/api/simulation/reset")
def reset_simulation():
    init_db()
    simulation_engine.reset()
    return {"status": "reset", "elapsedSeconds": 0}

@app.post("/api/simulation/speed")
def set_simulation_speed(speed: int = Query(..., ge=1, le=10)):
    simulation_engine.set_speed(speed)
    return {"status": "updated", "speed": speed}

@app.post("/api/simulation/demo")
def trigger_demo_mode():
    simulation_engine.start_scripted_demo()
    return {"status": "demo_started", "scenario": "City Morning Peak Simulation"}

@app.get("/api/inference/pipeline")
def get_inference_pipeline_state():
    sample_frame = active_inference_provider.process_frame({"busId": "BUS-004", "camera": "front"})
    return {
        "providerInfo": active_inference_provider.get_provider_info(),
        "liveInference": sample_frame
    }

# ================= DYNAMIC EVIDENCE IMAGE GENERATOR =================
@app.get("/evidence/{file_name}")
def get_evidence_image(file_name: str):
    """
    Generates deterministic, visually rich vector graphics (SVG) for demo evidence.
    Guarantees no broken links for potholes, camera frames, and ANPR crops.
    """
    is_anpr = "anpr" in file_name.lower()
    is_pothole = "defect" in file_name.lower() or "road" in file_name.lower()
    is_incident = "incident" in file_name.lower() or "frame" in file_name.lower()

    if is_anpr:
        plate = f"MH 12 RN {file_name.split('_')[-1].split('.')[0].zfill(4)}"
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="100%">
            <defs>
                <linearGradient id="anprBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b"/>
                    <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#anprBg)" rx="12"/>
            <rect x="20" y="20" width="560" height="200" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" rx="8"/>
            <text x="35" y="48" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">[EDGE ANPR ENGINE] - HIGH CONFIDENCE OCR</text>
            <!-- License Plate Indian Format -->
            <rect x="70" y="80" width="460" height="90" fill="#fef08a" stroke="#ca8a04" stroke-width="3" rx="8"/>
            <rect x="80" y="90" width="45" height="70" fill="#1d4ed8" rx="4"/>
            <circle cx="102" cy="118" r="14" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5"/>
            <text x="94" y="152" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">IND</text>
            <text x="145" y="145" fill="#0f172a" font-family="monospace" font-size="44" font-weight="900" letter-spacing="4">{plate}</text>
            <text x="35" y="205" fill="#94a3b8" font-family="sans-serif" font-size="12">OCR Model: LPRNet-India-v2 | Confidence: 97.4% | Edge Node: BUS-004 Jetson</text>
        </svg>"""
    elif is_pothole:
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" width="100%" height="100%">
            <defs>
                <linearGradient id="roadBg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#334155"/>
                    <stop offset="100%" stop-color="#1e293b"/>
                </linearGradient>
                <radialGradient id="potholeCavity" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#020617"/>
                    <stop offset="60%" stop-color="#090d16"/>
                    <stop offset="100%" stop-color="#1e293b"/>
                </radialGradient>
            </defs>
            <rect width="720" height="420" fill="url(#roadBg)"/>
            <!-- Road texture & lane lines -->
            <line x1="360" y1="0" x2="360" y2="420" stroke="#fbbf24" stroke-width="6" stroke-dasharray="24,20"/>
            <line x1="60" y1="0" x2="60" y2="420" stroke="#f8fafc" stroke-width="4" opacity="0.7"/>
            <line x1="660" y1="0" x2="660" y2="420" stroke="#f8fafc" stroke-width="4" opacity="0.7"/>
            <!-- Pothole Defect -->
            <ellipse cx="440" cy="230" rx="110" ry="65" fill="url(#potholeCavity)" stroke="#ef4444" stroke-width="3"/>
            <path d="M 370,220 Q 420,190 490,210 T 520,250 T 420,270 Z" fill="#020617" opacity="0.9"/>
            <!-- AI Bounding Box & HUD -->
            <rect x="310" y="145" width="260" height="170" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" stroke-width="2"/>
            <rect x="310" y="115" width="260" height="30" fill="#ef4444"/>
            <text x="320" y="135" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">POTHOLE: SEVERITY CRITICAL (94.2%)</text>
            <!-- Telemetry overlay -->
            <rect x="15" y="15" width="340" height="60" fill="rgba(15, 23, 42, 0.85)" rx="6"/>
            <text x="25" y="36" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">BUS-004 FRONT-CAM | FPS: 29.8 | INT8</text>
            <text x="25" y="58" fill="#e2e8f0" font-family="monospace" font-size="11">EST DIM: 52cm x 38cm | DEPTH: 8.5cm</text>
        </svg>"""
    else:
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" width="100%" height="100%">
            <rect width="720" height="420" fill="#0f172a"/>
            <!-- Perspective road -->
            <polygon points="120,420 600,420 420,180 300,180" fill="#1e293b"/>
            <line x1="360" y1="180" x2="360" y2="420" stroke="#facc15" stroke-width="4" stroke-dasharray="16,14"/>
            <!-- Tracked vehicle representation -->
            <rect x="290" y="220" width="140" height="90" rx="8" fill="#334155" stroke="#ef4444" stroke-width="2"/>
            <!-- AI Bounding Box -->
            <rect x="280" y="200" width="160" height="120" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2"/>
            <rect x="280" y="175" width="160" height="25" fill="#ef4444"/>
            <text x="288" y="192" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">ID: #104 RASH DRIVING</text>
            <!-- HUD -->
            <rect x="20" y="20" width="320" height="55" fill="rgba(15, 23, 42, 0.9)" rx="6"/>
            <text x="30" y="40" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">[SAFETY INCIDENT TELEMETRY]</text>
            <text x="30" y="60" fill="#cbd5e1" font-family="monospace" font-size="11">SPD: 68 km/h | SPEED LIMIT: 30 km/h</text>
        </svg>"""

    return Response(content=svg, media_type="image/svg+xml")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
