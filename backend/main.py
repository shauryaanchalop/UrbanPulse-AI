import os
import json
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from database import DB_PATH, init_db, get_db_connection
from models import (
    Bus, ServiceVehicle, Route, RoadSegment, RoadDefect, CitizenReport, RewardAccount, RewardRule,
    TrafficEvent, SafetyIncident, DistressAlert, ANPRDetection, WatchlistItem, WatchlistMatch,
    SurveyMission, VideoClip, EvidenceCase, MaintenanceTicket, User, AuditLog, SystemHealth,
    SimulationStatus, OverviewKPIs
)
from event_bus import event_bus
from simulation import simulation_engine
from inference import active_inference_provider, evidence_ranking_engine, plate_detection_provider
from auth import authenticate_user, verify_jwt_token, DEMO_ACCOUNTS, create_jwt_token
from notifications import NotificationService

notification_service = NotificationService(DB_PATH)

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.path.exists(DB_PATH):
        init_db()
    else:
        try:
            init_db()
        except Exception:
            pass

    sim_task = asyncio.create_task(simulation_engine.run_loop())
    yield
    sim_task.cancel()

app = FastAPI(
    title="UrbanPulse AI - Mobile Urban Intelligence Platform",
    description="Smart India Hackathon 2026 (Problem Statement ID: 26124)",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

event_bus.subscribe(broadcast_ws_message)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        await websocket.send_text(json.dumps({
            "topic": "connection_ack",
            "message": "Connected to UrbanPulse AI Multi-Layer Telemetry Stream",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "busesActive": 30,
                "simulationRunning": simulation_engine.is_running,
                "speedMultiplier": simulation_engine.speed_multiplier
            }
        }))
        while True:
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

# ================= AUTHENTICATION & DEMO ROLES =================

@app.post("/api/auth/login")
def login(payload: Dict[str, Any] = Body(...)):
    username_or_email = payload.get("username", payload.get("email", ""))
    password = payload.get("password", "")
    user = authenticate_user(DB_PATH, username_or_email, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return user

@app.post("/api/auth/demo-login")
def demo_login(payload: Dict[str, Any] = Body(...)):
    role_key = payload.get("role", "operator").lower().strip()
    if role_key not in DEMO_ACCOUNTS:
        role_key = "operator"
    user_info = DEMO_ACCOUNTS[role_key]
    token = create_jwt_token(user_info)
    return {**user_info, "token": token}

@app.get("/api/auth/me")
def get_current_user(token: str = Query(...)):
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session token")
    return payload

@app.post("/api/auth/register")
def register(payload: Dict[str, Any] = Body(...)):
    full_name = payload.get("fullName", "New UrbanPulse Citizen")
    email = payload.get("email", "")
    password = payload.get("password", "password123")
    role = payload.get("role", "CITIZEN")

    user_info = {
        "id": f"user-cit-{int(datetime.now().timestamp())}",
        "username": email.split("@")[0] if "@" in email else email,
        "email": email,
        "fullName": full_name,
        "role": role,
        "department": "Public Citizen",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
    token = create_jwt_token(user_info)
    return {**user_info, "token": token}

# ================= NOTIFICATIONS ENGINE =================

@app.get("/api/notifications")
def get_notifications(limit: int = Query(50)):
    return notification_service.get_notifications(limit)

@app.get("/api/notifications/rules")
def get_notification_rules():
    return notification_service.get_rules()

@app.post("/api/notifications/send")
def trigger_notification(payload: Dict[str, Any] = Body(...)):
    event_type = payload.get("eventType", "GENERAL_ALERT")
    severity = payload.get("severity", "High")
    title = payload.get("title", "UrbanPulse Operational Alert")
    message = payload.get("message", "Attention required for city sector")
    dept = payload.get("department", "Operations")

    deliveries = notification_service.send_notification(
        event_type=event_type,
        severity=severity,
        title=title,
        message=message,
        department=dept,
        metadata=payload.get("metadata")
    )
    return {"status": "SUCCESS", "deliveries": deliveries}

# ================= LIVE WEBCAM INFERENCE =================

@app.post("/api/inference/analyze-frame")
def analyze_frame(payload: Dict[str, Any] = Body(...)):
    frame_data = payload.get("frameData", "")
    return active_inference_provider.analyze_webcam_frame(frame_data)

# ================= DEPLOYMENT HEALTH CHECK =================

@app.get("/health")
def deployment_health():
    db_ok = False
    try:
        conn = get_db_connection()
        conn.close()
        db_ok = True
    except Exception:
        pass

    return {
        "status": "HEALTHY",
        "api": "ok",
        "database": "ok" if db_ok else "error",
        "storage": "local_demo_storage",
        "ai": "local_inference_active",
        "simulation": "running" if simulation_engine.is_running else "paused",
        "notifications": "sendgrid_twilio_abstraction_active",
        "timestamp": datetime.now().isoformat()
    }

# ================= REST API ENDPOINTS =================

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

    c.execute("SELECT COUNT(*) FROM maintenance_tickets WHERE status NOT IN ('RE_VERIFIED', 'CLOSED', 'Resolved')")
    open_tickets = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM road_defects WHERE status = 'Cross-verified'")
    verified_count = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM safety_incidents")
    safety_today = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM citizen_reports WHERE status = 'RECEIVED'")
    unverified_reports = c.fetchone()[0]

    conn.close()
    return OverviewKPIs(
        activeBuses=active_buses,
        totalRoadIssues=total_defects,
        criticalIncidents=critical_incidents,
        congestionHotspots=congestion_hotspots,
        openMaintenanceTickets=open_tickets,
        roadCoveragePercent=82.4,
        multiBusVerifiedCount=verified_count,
        safetyAlertsToday=safety_today,
        unverifiedReportsCount=unverified_reports,
        offlineBusesCount=2
    )

# --- ROAD SEGMENTS & ROAD HEALTH ---
@app.get("/api/road-segments", response_model=List[RoadSegment])
def get_road_segments():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM road_segments")
    rows = c.fetchall()
    conn.close()

    segments = []
    for r in rows:
        segments.append(RoadSegment(
            id=r["id"],
            segmentId=r["segmentId"],
            name=r["name"],
            sector=r["sector"],
            healthScore=r["healthScore"],
            condition=r["condition"],
            lastObservedAt=r["lastObservedAt"],
            observationCount=r["observationCount"],
            defectCount=r["defectCount"],
            criticality=r["criticality"],
            coverageState=r["coverageState"],
            openWorkOrders=r["openWorkOrders"],
            coordinates=json.loads(r["coordinates"] or "[]"),
            assignedVehicleType=r["assignedVehicleType"]
        ))
    return segments

# --- CITIZEN REPORTS & REWARDS ---
@app.get("/api/reports", response_model=List[CitizenReport])
def get_citizen_reports():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM citizen_reports ORDER BY submittedAt DESC")
    rows = c.fetchall()
    conn.close()

    reports = []
    for r in rows:
        reports.append(CitizenReport(
            id=r["id"],
            referenceNo=r["referenceNo"],
            reporterName=r["reporterName"],
            category=r["category"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            description=r["description"],
            photoUrl=r["photoUrl"],
            status=r["status"],
            aiClassification=r["aiClassification"],
            aiConfidence=r["aiConfidence"],
            aiSeverity=r["aiSeverity"],
            pointsAwarded=r["pointsAwarded"],
            submittedAt=r["submittedAt"],
            verificationSourcesCount=r["verificationSourcesCount"]
        ))
    return reports

@app.post("/api/reports", response_model=CitizenReport, status_code=status.HTTP_201_CREATED)
async def submit_citizen_report(report_data: Dict[str, Any]):
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM citizen_reports")
    next_idx = c.fetchone()[0] + 421
    ref_no = f"UP-2026-{next_idx:06d}"
    rep_id = f"REP-{ref_no}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    category = report_data.get("category", "Road Problem")
    lat = float(report_data.get("latitude", 18.5912))
    lng = float(report_data.get("longitude", 73.7389))
    desc = report_data.get("description", "Reported via UrbanPulse Citizen Portal")
    photo = report_data.get("photoUrl", "/evidence/road_defect_1.jpg")

    # AI Quick Classification Simulation
    ai_class = "Pothole" if category == "Road Problem" else ("Vehicle Incident" if category == "Accident / Incident" else "Safety Hazard")
    ai_conf = 0.91
    ai_sev = "High" if category in ["Accident / Incident", "Safety / Distress"] else "Medium"
    points = 10  # Initial valid report reward

    c.execute("""
    INSERT INTO citizen_reports (
        id, referenceNo, reporterName, category, latitude, longitude, address, description,
        photoUrl, status, aiClassification, aiConfidence, aiSeverity, pointsAwarded, submittedAt, verificationSourcesCount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rep_id, ref_no, "Citizen User", category, lat, lng,
        f"{category} near {lat:.4f}, {lng:.4f}", desc, photo,
        "RECEIVED", ai_class, ai_conf, ai_sev, points, now_str, 1
    ))

    # Award +10 points to citizen reward account
    c.execute("UPDATE reward_accounts SET points = points + 10, reportCount = reportCount + 1 WHERE userId = 'USR-001'")

    conn.commit()
    conn.close()

    new_report = CitizenReport(
        id=rep_id,
        referenceNo=ref_no,
        reporterName="Citizen User",
        category=category,
        latitude=lat,
        longitude=lng,
        address=f"{category} near {lat:.4f}, {lng:.4f}",
        description=desc,
        photoUrl=photo,
        status="RECEIVED",
        aiClassification=ai_class,
        aiConfidence=ai_conf,
        aiSeverity=ai_sev,
        pointsAwarded=points,
        submittedAt=now_str,
        verificationSourcesCount=1
    )

    await event_bus.publish("citizen_report_submitted", new_report.model_dump())
    return new_report

@app.get("/api/rewards/leaderboard", response_model=List[RewardAccount])
def get_reward_leaderboard():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM reward_accounts ORDER BY points DESC")
    rows = c.fetchall()
    conn.close()

    leaderboard = []
    for r in rows:
        leaderboard.append(RewardAccount(
            userId=r["userId"],
            userName=r["userName"],
            displayName=r["displayName"],
            points=r["points"],
            level=r["level"],
            badges=json.loads(r["badges"] or "[]"),
            reportCount=r["reportCount"],
            verifiedReportCount=r["verifiedReportCount"],
            impactScore=r["impactScore"],
            rank=r["rank"]
        ))
    return leaderboard

# --- EVIDENCE & INCIDENT ROUTE MATCHING ---
@app.post("/api/evidence/search")
def search_evidence(payload: Dict[str, Any]):
    """
    Search bus trajectories and camera clips near an incident location & time window.
    Returns ranked evidence clips.
    """
    lat = float(payload.get("latitude", 18.5912))
    lng = float(payload.get("longitude", 73.7389))
    radius_m = int(payload.get("radiusMeters", 500))
    now_dt = datetime.now()

    # Sample candidate clips from nearby buses
    candidate_clips = [
        {
            "id": "CLIP-004-F",
            "busId": "BUS-004",
            "cameraName": "front",
            "startTime": (now_dt - datetime.timedelta(seconds=45)).strftime("%Y-%m-%d %H:%M:%S"),
            "endTime": now_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "latitude": 18.5915,
            "longitude": 73.7391,
            "address": "Wakad Flyover Ramp, Sector 18",
            "videoUrl": "/evidence/clip_event_1.mp4",
            "thumbnailUrl": "/evidence/incident_frame_1.jpg",
            "matchedEvents": ["Pothole Defect", "Passing Vehicle UP-16-AB-1234"]
        },
        {
            "id": "CLIP-012-R",
            "busId": "BUS-012",
            "cameraName": "rear",
            "startTime": (now_dt - datetime.timedelta(seconds=120)).strftime("%Y-%m-%d %H:%M:%S"),
            "endTime": (now_dt - datetime.timedelta(seconds=60)).strftime("%Y-%m-%d %H:%M:%S"),
            "latitude": 18.5921,
            "longitude": 73.7398,
            "address": "Wakad Bridge Crossway",
            "videoUrl": "/evidence/clip_event_2.mp4",
            "thumbnailUrl": "/evidence/incident_frame_2.jpg",
            "matchedEvents": ["Multi-bus defect verification"]
        }
    ]

    ranked = evidence_ranking_engine.rank_clips(lat, lng, now_dt, candidate_clips, max_distance_m=radius_m)
    return {
        "caseRef": f"CASE-AC-2026-{random.randint(100, 999)}",
        "searchLocation": {"lat": lat, "lng": lng},
        "matchedCount": len(ranked),
        "clips": ranked
    }

# --- WATCHLIST & HUMAN VERIFICATION ---
@app.get("/api/watchlist", response_model=List[WatchlistItem])
def get_watchlist():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM vehicle_watchlist WHERE active = 1")
    rows = c.fetchall()
    conn.close()

    items = []
    for r in rows:
        items.append(WatchlistItem(
            id=r["id"],
            vehicleId=r["vehicleId"],
            plateNumber=r["plateNumber"],
            reason=r["reason"],
            department=r["department"],
            active=bool(r["active"]),
            validFrom=r["validFrom"],
            validUntil=r["validUntil"],
            notes=r["notes"],
            addedBy=r["addedBy"]
        ))
    return items

@app.get("/api/watchlist/matches", response_model=List[WatchlistMatch])
def get_watchlist_matches():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM watchlist_matches ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()

    matches = []
    for r in rows:
        matches.append(WatchlistMatch(
            id=r["id"],
            watchlistId=r["watchlistId"],
            plateNumber=r["plateNumber"],
            detectedByBusId=r["detectedByBusId"],
            timestamp=r["timestamp"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            confidence=r["confidence"],
            evidenceImageUrl=r["evidenceImageUrl"],
            status=r["status"],
            reviewedBy=r["reviewedBy"]
        ))
    return matches

@app.post("/api/watchlist/matches/{match_id}/action")
async def action_watchlist_match(match_id: str, payload: Dict[str, Any]):
    action = payload.get("action", "HUMAN_VERIFIED")
    reviewer = payload.get("reviewedBy", "Inspector D. K. Shinde")

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE watchlist_matches SET status = ?, reviewedBy = ? WHERE id = ?", (action, reviewer, match_id))
    
    # Audit log
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("""
    INSERT INTO audit_logs (id, userId, username, role, action, resource, details, timestamp, ipAddress)
    VALUES (?, 'USR-POL-01', 'investigator1', 'POLICE / AUTHORIZED INVESTIGATOR', ?, 'WatchlistMatch', ?, ?, '127.0.0.1')
    """, (f"LOG-{random.randint(100, 999)}", action, f"Updated match {match_id} status to {action}", now_str))

    conn.commit()
    conn.close()

    return {"status": "success", "matchId": match_id, "newStatus": action}

# --- WOMEN'S SAFETY / DISTRESS ---
@app.get("/api/safety/distress", response_model=List[DistressAlert])
def get_distress_alerts():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM distress_alerts ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()

    alerts = []
    for r in rows:
        alerts.append(DistressAlert(
            id=r["id"],
            alertCode=r["alertCode"],
            citizenName=r["citizenName"],
            category=r["category"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            address=r["address"],
            timestamp=r["timestamp"],
            status=r["status"],
            mediaUrl=r["mediaUrl"],
            nearestBusId=r["nearestBusId"],
            nearestResponseUnit=r["nearestResponseUnit"],
            notes=r["notes"]
        ))
    return alerts

@app.post("/api/safety/distress", response_model=DistressAlert, status_code=status.HTTP_201_CREATED)
async def create_distress_alert(payload: Dict[str, Any]):
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM distress_alerts")
    cnt = c.fetchone()[0] + 1
    alt_id = f"ALT-{cnt:03d}"
    alt_code = f"DIS-{8820 + cnt}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    category = payload.get("category", "PERSONAL SAFETY")
    lat = float(payload.get("latitude", 18.5362))
    lng = float(payload.get("longitude", 73.8301))
    address = payload.get("address", "University Circle Environs")

    c.execute("""
    INSERT INTO distress_alerts (id, alertCode, citizenName, category, latitude, longitude, address, timestamp, status, mediaUrl, nearestBusId, nearestResponseUnit, notes)
    VALUES (?, ?, 'Anonymous Citizen', ?, ?, ?, ?, ?, 'ACTIVE', '/evidence/incident_frame_1.jpg', 'BUS-004', 'PCR Unit #08', 'Emergency signal transmitted')
    """, (alt_id, alt_code, category, lat, lng, address, now_str))

    conn.commit()
    conn.close()

    new_alert = DistressAlert(
        id=alt_id,
        alertCode=alt_code,
        citizenName="Anonymous Citizen",
        category=category,
        latitude=lat,
        longitude=lng,
        address=address,
        timestamp=now_str,
        status="ACTIVE",
        mediaUrl="/evidence/incident_frame_1.jpg",
        nearestBusId="BUS-004",
        nearestResponseUnit="PCR Unit #08",
        notes="Emergency signal transmitted"
    )

    await event_bus.publish("distress_alert_created", new_alert.model_dump())
    return new_alert

# --- SURVEY MISSIONS ---
@app.get("/api/survey-missions", response_model=List[SurveyMission])
def get_survey_missions():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM survey_missions")
    rows = c.fetchall()
    conn.close()

    missions = []
    for r in rows:
        missions.append(SurveyMission(
            id=r["id"],
            missionCode=r["missionCode"],
            sector=r["sector"],
            roadSegmentIds=json.loads(r["roadSegmentIds"] or "[]"),
            priority=r["priority"],
            reason=r["reason"],
            recommendedVehicleId=r["recommendedVehicleId"],
            assignedVehicleCode=r["assignedVehicleCode"],
            status=r["status"],
            assignedAt=r["assignedAt"]
        ))
    return missions

@app.post("/api/survey-missions/{mission_id}/assign")
async def assign_survey_mission(mission_id: str, payload: Dict[str, Any]):
    vehicle_code = payload.get("vehicleCode", "MS-08")
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE survey_missions SET status = 'ASSIGNED', assignedVehicleCode = ? WHERE id = ?", (vehicle_code, mission_id))
    conn.commit()
    conn.close()
    return {"status": "assigned", "missionId": mission_id, "vehicleCode": vehicle_code}

# --- SERVICE VEHICLES FLEET ---
@app.get("/api/service-vehicles", response_model=List[ServiceVehicle])
def get_service_vehicles():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM service_vehicles")
    rows = c.fetchall()
    conn.close()

    vehicles = []
    for r in rows:
        vehicles.append(ServiceVehicle(
            id=r["id"],
            vehicleCode=r["vehicleCode"],
            department=r["department"],
            vehicleType=r["vehicleType"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            speed=r["speed"],
            status=r["status"],
            currentMissionId=r["currentMissionId"],
            lastActive=r["lastActive"]
        ))
    return vehicles

# --- BUSES, ROUTES, DEFECTS & MAINTENANCE ---
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
            cameras=json.loads(r["cameras"] or "[]"),
            vehicleType=r.get("vehicleType", "Public Transit Bus")
        ))
    return buses

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
def get_road_defects():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM road_defects ORDER BY lastSeen DESC")
    rows = c.fetchall()
    conn.close()

    defects = []
    for r in rows:
        rd = dict(r)
        defects.append(RoadDefect(
            id=rd["id"],
            defectType=rd["defectType"],
            severity=rd["severity"],
            confidence=rd["confidence"],
            latitude=rd["latitude"],
            longitude=rd["longitude"],
            address=rd["address"],
            routeId=rd["routeId"],
            detectedByBusId=rd["detectedByBusId"],
            firstSeen=rd["firstSeen"],
            lastSeen=rd["lastSeen"],
            timesConfirmed=rd["timesConfirmed"],
            status=rd["status"],
            priority=rd["priority"],
            evidenceImageUrl=rd["evidenceImageUrl"],
            dimensionsEstimated=rd["dimensionsEstimated"],
            crossVerifyingBuses=json.loads(rd.get("crossVerifyingBuses") or "[]"),
            segmentId=rd.get("segmentId")
        ))
    return defects

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
                plateNumber=anpr_data.get("plateNumber", "UP-16-AB-1234"),
                rawPlateText=anpr_data.get("plateNumber", "UP16AB1234"),
                vehicleType=anpr_data.get("vehicleType", "Vehicle"),
                confidence=anpr_data.get("confidence", 0.94),
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
            assignedDepartment=r.get("assignedDepartment", "Road Infrastructure Maintenance Dept"),
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
        address, reportedAt, targetResolutionDate, status, assignedContractor, assignedDepartment,
        confirmingBusesCount, estimatedCostInr, evidenceImageUrl, resolutionNotes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, ticket_code, defect_id, defect_type, priority, severity, lat, lng,
        address, now_str, "Within 48 Hours", "ASSIGNED", assigned, "Road Infrastructure Maintenance Dept",
        confirming, cost, evidence, "Auto-generated from Multi-Bus Verification"
    ))

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
        status="ASSIGNED",
        assignedContractor=assigned,
        assignedDepartment="Road Infrastructure Maintenance Dept",
        confirmingBusesCount=confirming,
        estimatedCostInr=cost,
        evidenceImageUrl=evidence,
        resolutionNotes="Auto-generated from Multi-Bus Verification"
    )

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

# --- SYSTEM HEALTH & ADMIN ---
@app.get("/api/system-health", response_model=SystemHealth)
def get_system_health():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM system_health LIMIT 1")
    r = c.fetchone()
    conn.close()
    if not r:
        return SystemHealth(
            activeBusesTotal=30,
            onlineBusesCount=28,
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

@app.get("/api/users", response_model=List[User])
def get_users():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    rows = c.fetchall()
    conn.close()

    users = []
    for r in rows:
        users.append(User(
            id=r["id"],
            username=r["username"],
            fullName=r["fullName"],
            role=r["role"],
            department=r["department"],
            email=r["email"],
            avatarUrl=r.get("avatarUrl")
        ))
    return users

@app.get("/api/audit-logs", response_model=List[AuditLog])
def get_audit_logs():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()

    logs = []
    for r in rows:
        logs.append(AuditLog(
            id=r["id"],
            userId=r["userId"],
            username=r["username"],
            role=r["role"],
            action=r["action"],
            resource=r["resource"],
            details=r["details"],
            timestamp=r["timestamp"],
            ipAddress=r["ipAddress"]
        ))
    return logs

# --- SIMULATION CONTROLS ---
@app.get("/api/simulation/status", response_model=SimulationStatus)
def get_simulation_status():
    return SimulationStatus(
        isRunning=simulation_engine.is_running,
        speed=simulation_engine.speed_multiplier,
        elapsedSeconds=simulation_engine.elapsed_seconds,
        isDemoMode=simulation_engine.is_demo_mode,
        demoStepIndex=simulation_engine.demo_step_index,
        demoStepDescription=simulation_engine.demo_step_description,
        activeBuses=30,
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
    return {"status": "demo_started", "scenario": "Smart City 19-Scene Closed-Loop Simulation"}

# ================= DYNAMIC EVIDENCE IMAGE GENERATOR =================
@app.get("/evidence/{file_name}")
def get_evidence_image(file_name: str):
    is_anpr = "anpr" in file_name.lower()
    is_pothole = "defect" in file_name.lower() or "road" in file_name.lower()

    if is_anpr:
        plate = "UP 16 AB 1234"
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="100%">
            <defs>
                <linearGradient id="anprBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b"/>
                    <stop offset="100%" stop-color="#0f172a"/>
                </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#anprBg)" rx="12"/>
            <rect x="20" y="20" width="560" height="200" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" rx="8"/>
            <text x="35" y="48" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">[EDGE ANPR OCR PROVIDER] - CONFIDENCE: 96.4%</text>
            <rect x="70" y="80" width="460" height="90" fill="#fef08a" stroke="#ca8a04" stroke-width="3" rx="8"/>
            <rect x="80" y="90" width="45" height="70" fill="#1d4ed8" rx="4"/>
            <circle cx="102" cy="118" r="14" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5"/>
            <text x="94" y="152" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">IND</text>
            <text x="145" y="145" fill="#0f172a" font-family="monospace" font-size="44" font-weight="900" letter-spacing="4">{plate}</text>
            <text x="35" y="205" fill="#94a3b8" font-family="sans-serif" font-size="12">OCR Model: LPRNet-India-v2 | Watchlist Status: POTENTIAL MATCH</text>
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
            <line x1="360" y1="0" x2="360" y2="420" stroke="#fbbf24" stroke-width="6" stroke-dasharray="24,20"/>
            <line x1="60" y1="0" x2="60" y2="420" stroke="#f8fafc" stroke-width="4" opacity="0.7"/>
            <line x1="660" y1="0" x2="660" y2="420" stroke="#f8fafc" stroke-width="4" opacity="0.7"/>
            <ellipse cx="440" cy="230" rx="110" ry="65" fill="url(#potholeCavity)" stroke="#ef4444" stroke-width="3"/>
            <rect x="310" y="145" width="260" height="170" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" stroke-width="2"/>
            <rect x="310" y="115" width="260" height="30" fill="#ef4444"/>
            <text x="320" y="135" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">POTHOLE: CRITICAL (94.2%)</text>
            <rect x="15" y="15" width="340" height="60" fill="rgba(15, 23, 42, 0.85)" rx="6"/>
            <text x="25" y="36" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">BUS-004 FRONT-CAM | FPS: 29.8 | INT8</text>
            <text x="25" y="58" fill="#e2e8f0" font-family="monospace" font-size="11">EST DIM: 52cm x 38cm | DEPTH: 8.5cm</text>
        </svg>"""
    else:
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" width="100%" height="100%">
            <rect width="720" height="420" fill="#0f172a"/>
            <polygon points="120,420 600,420 420,180 300,180" fill="#1e293b"/>
            <line x1="360" y1="180" x2="360" y2="420" stroke="#facc15" stroke-width="4" stroke-dasharray="16,14"/>
            <rect x="290" y="220" width="140" height="90" rx="8" fill="#334155" stroke="#ef4444" stroke-width="2"/>
            <rect x="280" y="200" width="160" height="120" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2"/>
            <rect x="280" y="175" width="160" height="25" fill="#ef4444"/>
            <text x="288" y="192" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">INCIDENT TELEMETRY</text>
            <rect x="20" y="20" width="320" height="55" fill="rgba(15, 23, 42, 0.9)" rx="6"/>
            <text x="30" y="40" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">[SAFETY INCIDENT RECORD]</text>
            <text x="30" y="60" fill="#cbd5e1" font-family="monospace" font-size="11">SPD: 68 km/h | BUS SENSOR NODE #004</text>
        </svg>"""

    return Response(content=svg, media_type="image/svg+xml")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
