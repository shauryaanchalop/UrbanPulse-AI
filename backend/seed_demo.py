import json
import random
from datetime import datetime, timedelta
from db_adapter import get_db_connection, get_db_type
from database_schema import create_all_tables, TABLE_DEFINITIONS

BASE_ROUTES = [
    {
        "id": "RT-101",
        "name": "Line 1: Hinjawadi IT Hub - Shivajinagar Express",
        "corridor": "Wakad - Aundh - Shivajinagar Corridor",
        "totalDistanceKm": 18.5,
        "activeBusesCount": 12,
        "avgSpeedKmH": 28.4,
        "congestionLevel": "Moderate",
        "waypoints": [
            {"lat": 18.5912, "lng": 73.7389, "name": "Hinjawadi Phase 1 Circle"},
            {"lat": 18.5985, "lng": 73.7621, "name": "Wakad Bridge"},
            {"lat": 18.5802, "lng": 73.7845, "name": "Vishal Nagar"},
            {"lat": 18.5583, "lng": 73.8074, "name": "Bremen Chowk, Aundh"},
            {"lat": 18.5362, "lng": 73.8301, "name": "Pune University Gate"},
            {"lat": 18.5314, "lng": 73.8446, "name": "Shivajinagar Interchange"}
        ]
    },
    {
        "id": "RT-102",
        "name": "Line 2: Kothrud Depot - Pune Station - Viman Nagar",
        "corridor": "Karve Road - Station - Airport Road",
        "totalDistanceKm": 21.2,
        "activeBusesCount": 10,
        "avgSpeedKmH": 22.1,
        "congestionLevel": "High",
        "waypoints": [
            {"lat": 18.5074, "lng": 73.8077, "name": "Kothrud Depot"},
            {"lat": 18.5039, "lng": 73.8288, "name": "Deccan Gymkhana"},
            {"lat": 18.5204, "lng": 73.8567, "name": "Pune Railway Station"},
            {"lat": 18.5441, "lng": 73.8862, "name": "Yerawada Chowk"},
            {"lat": 18.5679, "lng": 73.9143, "name": "Viman Nagar Phoenix"}
        ]
    },
    {
        "id": "RT-103",
        "name": "Line 3: Katraj - Swargate - Pune Station Metro Feeder",
        "corridor": "Satara Road Transit Spine",
        "totalDistanceKm": 14.8,
        "activeBusesCount": 10,
        "avgSpeedKmH": 24.5,
        "congestionLevel": "Moderate",
        "waypoints": [
            {"lat": 18.4575, "lng": 73.8588, "name": "Katraj Bus Terminus"},
            {"lat": 18.4791, "lng": 73.8592, "name": "Padmavati Corner"},
            {"lat": 18.5018, "lng": 73.8586, "name": "Swargate Multimodal Hub"},
            {"lat": 18.5204, "lng": 73.8567, "name": "Pune Station"}
        ]
    },
    {
        "id": "RT-104",
        "name": "Line 4: Baner High Street - Deccan - Pune Camp",
        "corridor": "Baner - Senapati Bapat Road - Camp",
        "totalDistanceKm": 16.4,
        "activeBusesCount": 8,
        "avgSpeedKmH": 26.0,
        "congestionLevel": "Low",
        "waypoints": [
            {"lat": 18.5590, "lng": 73.7868, "name": "Baner High Street"},
            {"lat": 18.5451, "lng": 73.8152, "name": "Pashan Circle"},
            {"lat": 18.5305, "lng": 73.8285, "name": "Senapati Bapat Road"},
            {"lat": 18.5167, "lng": 73.8732, "name": "MG Road, Pune Camp"}
        ]
    },
    {
        "id": "RT-105",
        "name": "Line 5: Hadapsar Magarpatta - Station - PCMC Hub",
        "corridor": "East-West Industrial Tech Corridor",
        "totalDistanceKm": 27.6,
        "activeBusesCount": 10,
        "avgSpeedKmH": 31.2,
        "congestionLevel": "Moderate",
        "waypoints": [
            {"lat": 18.5135, "lng": 73.9312, "name": "Hadapsar Magarpatta Cybercity"},
            {"lat": 18.5204, "lng": 73.8567, "name": "Pune Station"},
            {"lat": 18.5314, "lng": 73.8446, "name": "Shivajinagar"},
            {"lat": 18.6279, "lng": 73.8131, "name": "Pimpri Chinchwad Municipal Corp"}
        ]
    }
]

# Generate additional 20 routes for 25 total routes
for extra_idx in range(6, 26):
    r_id = f"RT-{100 + extra_idx}"
    corridors_pool = ["Pasha Road Link", "Bavdhan Express Corridor", "Kalyani Nagar Outer Ring", "Wadgaon Sheri Arterial", "Sangvi Spine", "Warje Ring Road"]
    name = f"Line {extra_idx}: Sector {extra_idx} Circular Feeder"
    corr = random.choice(corridors_pool)
    base_lat = 18.5204 + random.uniform(-0.06, 0.06)
    base_lng = 73.8567 + random.uniform(-0.06, 0.06)
    wps = [
        {"lat": base_lat, "lng": base_lng, "name": f"Terminal {extra_idx}A"},
        {"lat": base_lat + random.uniform(-0.02, 0.02), "lng": base_lng + random.uniform(-0.02, 0.02), "name": f"Stop {extra_idx}B"},
        {"lat": base_lat + random.uniform(-0.04, 0.04), "lng": base_lng + random.uniform(-0.04, 0.04), "name": f"Stop {extra_idx}C"},
        {"lat": base_lat + random.uniform(-0.05, 0.05), "lng": base_lng + random.uniform(-0.05, 0.05), "name": f"Terminal {extra_idx}D"}
    ]
    BASE_ROUTES.append({
        "id": r_id,
        "name": name,
        "corridor": corr,
        "totalDistanceKm": round(random.uniform(12.0, 25.0), 1),
        "activeBusesCount": random.randint(3, 6),
        "avgSpeedKmH": round(random.uniform(20.0, 34.0), 1),
        "congestionLevel": random.choice(["Low", "Moderate", "High"]),
        "waypoints": wps
    })

def seed_demo_data():
    db_type = get_db_type()
    print(f"[Seed Demo] Seeding Comprehensive UrbanPulse AI Demo Data (Database Mode: {db_type.upper()})...")

    conn = get_db_connection()
    create_all_tables(conn)

    cur = conn.cursor()

    # Clear existing data safely
    tables = list(TABLE_DEFINITIONS.keys())
    for tbl in tables:
        try:
            cur.execute(f"DELETE FROM {tbl}")
        except Exception as e:
            print(f"[Seed Demo] Warning clearing {tbl}:", e)
    conn.commit()

    now = datetime.now()

    # 1. Seed 25 Routes
    for r in BASE_ROUTES:
        cur.execute("""
            INSERT INTO routes (id, name, corridor, totalDistanceKm, activeBusesCount, avgSpeedKmH, congestionLevel, waypoints)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["name"], r["corridor"], r["totalDistanceKm"],
            r["activeBusesCount"], r["avgSpeedKmH"], r["congestionLevel"],
            json.dumps(r["waypoints"])
        ))

    # 2. Seed 105 Buses
    bus_counter = 1
    while bus_counter <= 105:
        r = BASE_ROUTES[bus_counter % len(BASE_ROUTES)]
        wps = r["waypoints"]
        bus_id = f"BUS-{bus_counter:03d}"
        fleet_num = f"MH-12-RN-{1000 + bus_counter}"
        start_wp = bus_counter % len(wps)
        next_wp = (start_wp + 1) % len(wps)
        frac = random.uniform(0.1, 0.8)
        lat = wps[start_wp]["lat"] + frac * (wps[next_wp]["lat"] - wps[start_wp]["lat"])
        lng = wps[start_wp]["lng"] + frac * (wps[next_wp]["lng"] - wps[start_wp]["lng"])
        speed = round(random.uniform(18.0, 42.0), 1)
        heading = round(random.uniform(0, 359), 1)

        status = "Active"
        if bus_counter in [8, 22, 45, 68, 89]:
            status = "Warning"
        elif bus_counter in [15, 52, 94]:
            status = "Idle"

        cameras = [
            {"id": f"{bus_id}-CAM-F", "name": "front", "status": "active", "resolution": "1080p", "fps": 30.0},
            {"id": f"{bus_id}-CAM-R", "name": "rear", "status": "active", "resolution": "1080p", "fps": 25.0},
            {"id": f"{bus_id}-CAM-L", "name": "left", "status": "active", "resolution": "720p", "fps": 25.0},
            {"id": f"{bus_id}-CAM-RT", "name": "right", "status": "active", "resolution": "720p", "fps": 25.0}
        ]

        last_events = [
            "Pothole classified with 94% conf",
            "Pedestrian proximity threshold monitored",
            "Traffic density metadata transmitted",
            "Lane boundary defect detected",
            "Number plate logged: UP-16-AB-1234",
            "Waterlogging patch tagged",
            "Cracked asphalt patch registered",
            "Faded zebra crossing detected"
        ]

        cur.execute("""
            INSERT INTO buses (
                id, fleetNumber, routeId, routeName, status, latitude, longitude, speed, heading,
                cameraHealth, gpsHealth, networkStatus, edgeFps, gpuUtilization, lastEvent,
                lastUpdateTime, currentPassengerLoad, cameras, currentWaypointIndex, direction, vehicleType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            bus_id, fleet_num, r["id"], r["name"], status, lat, lng, speed, heading,
            "Optimal" if status != "Warning" else "Minor Glitch (CAM-R)",
            "High Accuracy (RTK)", "5G Connected",
            round(random.uniform(28.5, 30.2), 1), random.randint(45, 78),
            random.choice(last_events),
            (now - timedelta(seconds=random.randint(2, 45))).strftime("%Y-%m-%d %H:%M:%S"),
            random.randint(18, 55), json.dumps(cameras), start_wp, 1, "Public Transit Bus"
        ))
        bus_counter += 1

    # 3. Seed 42 Service Vehicles
    depts = ["PMC Sanitation Dept", "PMC Road Works", "PMC Water Supply", "PMC Waste Mgmt", "PMC Maintenance", "PMC Enforcement", "PMC Pothole Squad", "PMC Electrical"]
    for sv_i in range(1, 43):
        sv_id = f"MS-{sv_i:02d}"
        v_code = f"MH-12-PMC-{100 + sv_i}"
        dept = depts[sv_i % len(depts)]
        v_type = random.choice(["Sanitation Vehicle", "Road Inspection Truck", "Utility Tanker", "Refuse Collector", "Light Repair Van", "Traffic Survey Patrol", "Patching Vehicle", "Streetlight Repair Crane"])
        s_lat = 18.5204 + random.uniform(-0.08, 0.08)
        s_lng = 73.8567 + random.uniform(-0.08, 0.08)
        cur.execute("""
            INSERT INTO service_vehicles (id, vehicleCode, department, vehicleType, latitude, longitude, speed, status, currentMissionId, lastActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sv_id, v_code, dept, v_type, s_lat, s_lng, round(random.uniform(15, 32), 1), "Active" if sv_i % 6 != 0 else "Standby", None, now.strftime("%Y-%m-%d %H:%M:%S")))

    # 4. Seed 1020 Road Segments
    sectors = ["Sector 12 - Wakad", "Sector 18 - Aundh", "Sector 04 - Kothrud", "Sector 21 - Swargate", "Sector 09 - Viman Nagar", "Sector 15 - Baner", "Sector 07 - Hadapsar", "Sector 03 - PCMC Spine"]
    segment_prefixes = ["Wakad Ramp", "Aundh Bremen Chowk", "Karve Road Spine", "Satara Underpass", "Nagar Road Junction", "Baner High St Link", "University Circle", "Hinjawadi Loop", "Magarpatta Connector", "Kalyani Riverside", "Pimpri ROB", "Pashan Gully"]

    for i in range(1, 1021):
        seg_id = f"SEG-{i:04d}"
        sname = f"{random.choice(segment_prefixes)} Block {i}"
        sec = sectors[i % len(sectors)]

        if i % 15 == 0:
            cond = "Critical"
            health = random.randint(18, 38)
            cov = "RECENTLY_OBSERVED"
            def_cnt = random.randint(3, 6)
        elif i % 7 == 0:
            cond = "Attention"
            health = random.randint(42, 65)
            cov = "RECENTLY_OBSERVED"
            def_cnt = random.randint(1, 3)
        elif i % 5 == 0:
            cond = "Degrading"
            health = random.randint(68, 79)
            cov = "AGING_OBSERVATION"
            def_cnt = 1
        elif i % 9 == 0:
            cond = "Unknown"
            health = 50
            cov = "UNOBSERVED"
            def_cnt = 0
        else:
            cond = "Healthy"
            health = random.randint(84, 99)
            cov = "RECENTLY_OBSERVED"
            def_cnt = 0

        base_lat = 18.5204 + random.uniform(-0.12, 0.12)
        base_lng = 73.8567 + random.uniform(-0.12, 0.12)
        coords = [
            {"lat": base_lat, "lng": base_lng},
            {"lat": base_lat + random.uniform(-0.004, 0.004), "lng": base_lng + random.uniform(-0.004, 0.004)}
        ]

        cur.execute("""
            INSERT INTO road_segments (
                id, segmentId, name, sector, healthScore, condition, lastObservedAt,
                observationCount, defectCount, criticality, coverageState, openWorkOrders, coordinates, assignedVehicleType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            seg_id, seg_id, sname, sec, health, cond,
            (now - timedelta(minutes=random.randint(5, 720))).strftime("%Y-%m-%d %H:%M:%S"),
            random.randint(4, 48), def_cnt,
            "High" if cond in ["Critical", "Attention"] else "Low",
            cov, 1 if cond == "Critical" else 0, json.dumps(coords),
            "Public Bus Fleet" if cov != "UNOBSERVED" else "Municipal Service Vehicle"
        ))

    # 5. Seed 520 Road Defects
    defect_types = ["Pothole", "Waterlogging", "Damaged Sign", "Missing Road Marking", "Broken Divider", "Surface Cracking"]
    severities = ["Critical", "High", "Medium", "Low"]
    addresses = [
        "Wakad Flyover Ramp, Hinjawadi Road", "Bremen Chowk, Aundh", "Pune University Circle North",
        "Deccan Gymkhana Karve Statue", "Yerawada Bridge Southbound", "Viman Nagar Symbiosis Chowk",
        "Katraj Bypass Junction", "Swargate ST Stand Gate", "Baner High Street Crossway",
        "Hadapsar Magarpatta North Gate", "Kalyani Nagar Jogger's Park Road", "Pimpri Railway Overbridge"
    ]

    for d_idx in range(1, 521):
        def_id = f"DEF-{d_idx:04d}"
        dtype = random.choice(defect_types)
        sev = random.choices(severities, weights=[0.25, 0.45, 0.25, 0.05])[0] if dtype == "Pothole" else random.choices(severities, weights=[0.1, 0.3, 0.45, 0.15])[0]
        r_choice = BASE_ROUTES[d_idx % len(BASE_ROUTES)]
        wp = random.choice(r_choice["waypoints"])
        d_lat = wp["lat"] + random.uniform(-0.012, 0.012)
        d_lng = wp["lng"] + random.uniform(-0.012, 0.012)
        addr = f"{random.choice(addresses)} #{d_idx}"

        times_confirmed = 1
        cross_buses = [f"BUS-{(d_idx % 105) + 1:03d}"]
        confidence = round(random.uniform(0.75, 0.88), 2)
        status = "Reported"

        if d_idx % 3 == 0:
            times_confirmed = random.randint(2, 5)
            cross_buses = [f"BUS-{(d_idx + i) % 105 + 1:03d}" for i in range(times_confirmed)]
            confidence = round(random.uniform(0.92, 0.98), 2)
            status = "Cross-verified"
        elif d_idx % 5 == 0:
            times_confirmed = random.randint(2, 4)
            cross_buses = [f"BUS-{(d_idx + i) % 105 + 1:03d}" for i in range(times_confirmed)]
            confidence = round(random.uniform(0.90, 0.96), 2)
            status = "Ticket Created"

        priority = "P1" if (sev == "Critical" and times_confirmed >= 2) else ("P2" if sev in ["Critical", "High"] else "P3")
        dims = f"{random.randint(30, 85)}cm x {random.randint(20, 60)}cm, {random.randint(5, 15)}cm depth" if dtype == "Pothole" else None

        cur.execute("""
            INSERT INTO road_defects (
                id, defectType, severity, confidence, latitude, longitude, address, routeId,
                detectedByBusId, firstSeen, lastSeen, timesConfirmed, status, priority,
                evidenceImageUrl, dimensionsEstimated, crossVerifyingBuses, segmentId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            def_id, dtype, sev, confidence, d_lat, d_lng, addr, r_choice["id"],
            cross_buses[0],
            (now - timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M:%S"),
            (now - timedelta(minutes=random.randint(5, 300))).strftime("%Y-%m-%d %H:%M:%S"),
            times_confirmed, status, priority,
            f"/evidence/road_defect_{d_idx % 12 + 1}.jpg", dims, json.dumps(cross_buses), f"SEG-{(d_idx % 1020) + 1:04d}"
        ))

    # 6. Seed 510 Citizen Reports
    for c_i in range(1, 511):
        ref_no = f"UP-2026-{10000 + c_i}"
        cur.execute("""
            INSERT INTO citizen_reports (
                id, referenceNo, reporterName, category, latitude, longitude, address, description,
                photoUrl, status, aiClassification, aiConfidence, aiSeverity, pointsAwarded, submittedAt, verificationSourcesCount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"REP-{c_i:04d}", ref_no, f"Citizen Reporter #{c_i}",
            random.choice(["Road Problem", "Safety / Distress", "Accident / Incident", "Traffic Issue"]),
            18.5204 + random.uniform(-0.09, 0.09), 73.8567 + random.uniform(-0.09, 0.09),
            f"Urban Sector Spot #{c_i}", f"Issue description for report #{ref_no}",
            f"/evidence/road_defect_{c_i % 12 + 1}.jpg",
            random.choice(["SUBMITTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"]),
            random.choice(["Pothole", "Waterlogging", "Signal Defect", "Safety Hazard"]),
            round(random.uniform(0.85, 0.96), 2), random.choice(["Low", "Medium", "High", "Critical"]),
            random.choice([10, 25, 50]),
            (now - timedelta(hours=random.randint(1, 120))).strftime("%Y-%m-%d %H:%M:%S"),
            random.randint(1, 4)
        ))

    # 7. Seed Reward Accounts & Rules
    reward_users = [
        ("USR-001", "Rahul Sharma", "Rahul S.", 1450, "Gold", ["Road Watcher", "Safety Reporter", "Urban Sentinel"], 18, 14, 92.0, 1),
        ("USR-002", "Priya Verma", "Priya V.", 1120, "Silver", ["Road Watcher", "Community Monitor"], 14, 10, 84.0, 2),
        ("USR-003", "Amit Deshmukh", "Amit D.", 980, "Silver", ["Safety Reporter"], 11, 9, 78.0, 3),
        ("USR-004", "Neha Kulkarni", "Neha K.", 760, "Bronze", ["Road Watcher"], 9, 7, 71.0, 4),
        ("USR-005", "Vikram Patil", "Vikram P.", 540, "Bronze", ["Community Monitor"], 6, 4, 62.0, 5)
    ]
    for ru in reward_users:
        cur.execute("""
            INSERT INTO reward_accounts (userId, userName, displayName, points, level, badges, reportCount, verifiedReportCount, impactScore, rank)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ru[0], ru[1], ru[2], ru[3], ru[4], json.dumps(ru[5]), ru[6], ru[7], ru[8], ru[9]))

    reward_rules_data = [
        ("RUL-01", "VALID_REPORT", 10, "Awarded when citizen report passes initial AI validity check", 1),
        ("RUL-02", "VERIFIED_DEFECT", 25, "Awarded when report is independently confirmed by fleet sensor or operator", 1),
        ("RUL-03", "CRITICAL_INCIDENT", 50, "Awarded for actionable critical safety/hazard alerts", 1),
        ("RUL-04", "REPAIR_CONFIRMATION", 20, "Awarded when citizen photo verifies municipal repair work", 1),
        ("RUL-05", "SPAM_SUBMISSION", 0, "Zero points for duplicate, non-actionable or invalid reports", 1)
    ]
    for rr in reward_rules_data:
        cur.execute("INSERT INTO reward_rules (id, event, points, description, enabled) VALUES (?, ?, ?, ?, ?)", rr)

    # 8. Seed 510 Traffic Events
    corridors = [
        ("Wakad-Hinjawadi Flyover Spine", 18.5985, 73.7621),
        ("Pune University Grade Separator", 18.5362, 73.8301),
        ("Karve Road Nal Stop Metro Corridor", 18.5039, 73.8288),
        ("Yerawada Chowk Nagar Road", 18.5441, 73.8862),
        ("Swargate Multimodal Junction", 18.5018, 73.8586)
    ]
    for t_idx in range(1, 511):
        corr, clat, clng = random.choice(corridors)
        t_lat = clat + random.uniform(-0.015, 0.015)
        t_lng = clng + random.uniform(-0.015, 0.015)
        cong = random.choices(["Low", "Moderate", "Heavy", "Standstill"], weights=[0.2, 0.45, 0.25, 0.1])[0]
        avg_spd = 12.0 if cong == "Standstill" else (18.5 if cong == "Heavy" else (26.0 if cong == "Moderate" else 38.0))
        delay = round(max(1.0, (45.0 - avg_spd) * 0.45), 1)
        density = round(min(0.98, max(0.2, (50.0 - avg_spd) / 45.0)), 2)

        cur.execute("""
            INSERT INTO traffic_events (
                id, corridorName, latitude, longitude, congestionLevel, averageSpeedKmH,
                freeFlowSpeedKmH, delayMinutes, affectedVehiclesEstimate, observedByBusId, timestamp, densityScore
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"TRF-{t_idx:04d}", corr, t_lat, t_lng, cong, avg_spd, 45.0, delay,
            random.randint(120, 850), f"BUS-{(t_idx % 105) + 1:03d}",
            (now - timedelta(minutes=random.randint(1, 120))).strftime("%Y-%m-%d %H:%M:%S"), density
        ))

    # 9. Seed 305 Safety Incidents
    safety_types = ["Rash Driving", "Dangerous Pedestrian Proximity", "Near Collision", "Hit & Run Alert", "Sudden Lane Swerve"]
    for s_idx in range(1, 306):
        itype = random.choice(safety_types)
        isev = "Critical" if "Hit & Run" in itype or "Rash" in itype else "High"
        r_choice = BASE_ROUTES[s_idx % len(BASE_ROUTES)]
        wp = random.choice(r_choice["waypoints"])
        bus_id = f"BUS-{(s_idx % 105) + 1:03d}"
        plate_str = f"UP-16-AB-{1000 + s_idx * 7}"

        anpr_dict = {
            "plateNumber": plate_str,
            "vehicleType": "Sedan / Hatchback",
            "confidence": 0.94,
            "demoOcrCropUrl": f"/evidence/anpr_crop_{s_idx % 8 + 1}.jpg"
        }

        cur.execute("""
            INSERT INTO safety_incidents (
                id, incidentType, severity, confidence, latitude, longitude, address,
                timestamp, busId, routeId, status, trackedObject, eventDescription,
                videoRefUrl, evidenceImageUrl, anprInfo, actionTaken
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"INC-{s_idx:04d}", itype, isev, round(random.uniform(0.85, 0.96), 2),
            wp["lat"] + random.uniform(-0.009, 0.009), wp["lng"] + random.uniform(-0.009, 0.009),
            f"{wp['name']} Environs", (now - timedelta(minutes=random.randint(5, 480))).strftime("%Y-%m-%d %H:%M:%S"),
            bus_id, r_choice["id"], random.choice(["Detected", "Verified", "Escalated to Police", "Resolved"]),
            f"Vehicle ({plate_str})", f"Safety incident logged on {wp['name']}", f"/evidence/clip_event_{s_idx % 6 + 1}.mp4",
            f"/evidence/incident_frame_{s_idx % 8 + 1}.jpg", json.dumps(anpr_dict),
            "AI flagged for operator verification"
        ))

    # 10. Seed 105 Distress Alerts
    for d_i in range(1, 106):
        d_code = f"DIS-{8800 + d_i}"
        cat = random.choice(["PERSONAL SAFETY", "HARASSMENT", "MEDICAL", "UNSAFE CORNER"])
        stat = random.choice(["RECEIVED", "ACKNOWLEDGED", "RESPONDING", "RESOLVED"])
        cur.execute("""
            INSERT INTO distress_alerts (id, alertCode, citizenName, category, latitude, longitude, address, timestamp, status, mediaUrl, nearestBusId, nearestResponseUnit, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"ALT-{d_i:03d}", d_code, f"Citizen Distress User #{d_i}", cat,
            18.5204 + random.uniform(-0.07, 0.07), 73.8567 + random.uniform(-0.07, 0.07),
            f"Sector Urban Location #{d_i}", (now - timedelta(minutes=random.randint(1, 360))).strftime("%Y-%m-%d %H:%M:%S"),
            stat, "/evidence/incident_frame_1.jpg", f"BUS-{(d_i % 105) + 1:03d}", f"PCR Patrol Unit #{d_i % 15 + 1}",
            "Emergency telemetry link dispatched to nearest mobile sensor bus"
        ))

    # 11. Seed 510 ANPR Detections
    for a_idx in range(1, 511):
        plate_str = f"UP-16-AB-{1000 + a_idx * 11}"
        cur.execute("""
            INSERT INTO anpr_detections (
                id, plateNumber, rawPlateText, vehicleType, confidence, color, speedEstimated,
                latitude, longitude, timestamp, busId, flaggedReason, demoOcrCropUrl
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"ANPR-{a_idx:04d}", plate_str, plate_str, "Sedan", round(random.uniform(0.88, 0.99), 2),
            random.choice(["White", "Black", "Silver", "Red", "Blue"]), round(random.uniform(25.0, 65.0), 1),
            18.5204 + random.uniform(-0.08, 0.08), 73.8567 + random.uniform(-0.08, 0.08),
            (now - timedelta(minutes=random.randint(1, 300))).strftime("%Y-%m-%d %H:%M:%S"),
            f"BUS-{(a_idx % 105) + 1:03d}", "Routine Traffic Sensing", f"/evidence/anpr_crop_{a_idx % 8 + 1}.jpg"
        ))

    # 12. Seed 52 Vehicle Watchlist Entries & Matches
    for w_i in range(1, 53):
        p_num = f"UP-16-AB-{1000 + w_i * 13}"
        cur.execute("""
            INSERT INTO vehicle_watchlist (id, vehicleId, plateNumber, reason, department, active, validFrom, validUntil, notes, addedBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"WTL-{w_i:03d}", f"VEH-{900 + w_i}", p_num,
            f"Suspected involvement in traffic/security incident #{w_i}", "Traffic Police", 1,
            "2026-01-01", "2026-12-31", "High priority alert", f"Officer #{w_i}"
        ))

    cur.execute("""
        INSERT INTO watchlist_matches (id, watchlistId, plateNumber, detectedByBusId, timestamp, latitude, longitude, address, confidence, evidenceImageUrl, status, reviewedBy)
        VALUES ('MAT-001', 'WTL-001', 'UP-16-AB-1234', 'BUS-004', ?, 18.5912, 73.7389, 'Wakad Bridge Ramp', 0.94, '/evidence/anpr_crop_1.jpg', 'POTENTIAL_MATCH', NULL)
    """, ((now - timedelta(minutes=14)).strftime("%Y-%m-%d %H:%M:%S"),))

    # 13. Seed 105 Survey Missions
    for sm_i in range(1, 106):
        cur.execute("""
            INSERT INTO survey_missions (id, missionCode, sector, roadSegmentIds, priority, reason, recommendedVehicleId, assignedVehicleCode, status, assignedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"MIS-{sm_i:03d}", f"MISSION #{sm_i:03d}", f"Sector {sm_i % 20 + 1}",
            json.dumps([f"SEG-{sm_i % 1000 + 1:04d}"]),
            random.choice(["HIGH", "MEDIUM", "LOW"]),
            "Coverage gap detected; secondary vehicle survey required",
            f"MS-{(sm_i % 42) + 1:02d}", f"MS-{(sm_i % 42) + 1:02d}",
            random.choice(["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"]),
            now.strftime("%Y-%m-%d %H:%M:%S")
        ))

    # 14. Seed 210 Video Clips
    for v_idx in range(1, 211):
        cur.execute("""
            INSERT INTO video_clips (
                id, busId, cameraName, startTime, endTime, latitude, longitude, address,
                videoUrl, thumbnailUrl, relevanceScore, matchedEvents
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"CLIP-{v_idx:04d}", f"BUS-{(v_idx % 105) + 1:03d}", "front",
            (now - timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
            (now - timedelta(minutes=28)).strftime("%Y-%m-%d %H:%M:%S"),
            18.5204 + random.uniform(-0.06, 0.06), 73.8567 + random.uniform(-0.06, 0.06),
            "Transit Corridor Segment", f"/evidence/clip_event_{v_idx % 6 + 1}.mp4",
            f"/evidence/incident_frame_{v_idx % 8 + 1}.jpg", round(random.uniform(0.78, 0.98), 2),
            json.dumps(["POTHOLE_DETECTION", "TRAFFIC_DENSITY"])
        ))

    # 15. Seed 255 Maintenance Work Orders
    contractors = ["Pune Smart Infra Ltd", "PMC Road Works Dept", "Apex Asphalt & Civil Repairs"]
    for m_idx in range(1, 256):
        def_code = f"DEF-{m_idx:04d}"
        t_code = f"TKT-2026-{1000 + m_idx}"
        dtype = random.choice(["Pothole", "Waterlogging", "Damaged Sign", "Missing Road Marking", "Broken Divider"])
        sev = random.choice(["Critical", "High", "Medium", "Low"])
        prio = "P1" if sev == "Critical" else ("P2" if sev == "High" else "P3")
        stat = random.choices(["DETECTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "PENDING_VERIFICATION", "RE_VERIFIED"], weights=[0.2, 0.2, 0.2, 0.2, 0.1, 0.05, 0.05])[0]

        rep_date = now - timedelta(days=random.randint(1, 10))
        target_date = rep_date + timedelta(days=3 if prio in ["P1", "P2"] else 7)

        cur.execute("""
            INSERT INTO maintenance_tickets (
                id, ticketCode, defectId, defectType, priority, severity, latitude, longitude,
                address, reportedAt, targetResolutionDate, status, assignedContractor, assignedDepartment,
                confirmingBusesCount, estimatedCostInr, evidenceImageUrl, resolutionNotes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"MNT-{m_idx:04d}", t_code, def_code, dtype, prio, sev,
            18.5204 + random.uniform(-0.08, 0.08), 73.8567 + random.uniform(-0.08, 0.08),
            f"Corridor Sector #{m_idx}", rep_date.strftime("%Y-%m-%d %H:%M:%S"), target_date.strftime("%Y-%m-%d %H:%M:%S"),
            stat, random.choice(contractors), "Road Infrastructure Maintenance Dept", random.randint(2, 5),
            random.randint(15000, 145000), f"/evidence/road_defect_{m_idx % 12 + 1}.jpg",
            "Dispatched asphalt repair squad" if stat in ["IN_PROGRESS", "COMPLETED", "RE_VERIFIED"] else None
        ))

    # 16. Seed Users for 5 roles
    users_data = [
        ("USR-ADM-01", "admin@demo.urbanpulse.ai", "System Admin User", "SYSTEM ADMIN", "IT & Governance", "admin@demo.urbanpulse.ai"),
        ("USR-OP-01", "operator@demo.urbanpulse.ai", "Municipal Operator User", "MUNICIPAL OPERATOR", "Smart City ICCC Ops", "operator@demo.urbanpulse.ai"),
        ("USR-FLT-01", "fleet@demo.urbanpulse.ai", "Fleet Operator User", "FLEET OPERATOR", "PMPML Transit Ops", "fleet@demo.urbanpulse.ai"),
        ("USR-POL-01", "investigator@demo.urbanpulse.ai", "Investigator User", "INVESTIGATOR", "Urban Traffic Police", "investigator@demo.urbanpulse.ai"),
        ("USR-CIT-01", "citizen@demo.urbanpulse.ai", "Citizen User", "CITIZEN", "Public Citizen", "citizen@demo.urbanpulse.ai")
    ]
    for u in users_data:
        cur.execute("INSERT INTO users (id, username, fullName, role, department, email) VALUES (?, ?, ?, ?, ?, ?)", u)

    # 17. Seed 1020 Audit Logs & Notifications
    for log_i in range(1, 1021):
        cur.execute("""
            INSERT INTO audit_logs (id, userId, username, role, action, resource, details, timestamp, ipAddress)
            VALUES (?, 'USR-OP-01', 'operator@demo.urbanpulse.ai', 'MUNICIPAL OPERATOR', 'VIEW_RESOURCE', ?, 'Audit event recorded for operational system log', ?, '10.0.4.12')
        """, (f"LOG-{log_i:04d}", f"Resource #{log_i}", (now - timedelta(minutes=log_i * 2)).strftime("%Y-%m-%d %H:%M:%S")))

    for notif_i in range(1, 1021):
        cur.execute("""
            INSERT INTO notifications (id, eventType, severity, department, title, message, targetEmail, targetPhone, channel, status, timestamp, metadataJson)
            VALUES (?, 'CRITICAL_DEFECT', 'Critical', 'Road Engineering', ?, 'Operational alert notification payload', 'operator@demo.urbanpulse.ai', '+919822011223', 'EMAIL', 'SENT_DEMO', ?, '{}')
        """, (f"NOTIF-{notif_i:04d}", f"Critical Alert #{notif_i}", (now - timedelta(minutes=notif_i * 3)).strftime("%Y-%m-%d %H:%M:%S")))

    # 18. System Health
    cur.execute("""
        INSERT INTO system_health (
            id, activeBusesTotal, onlineBusesCount, cameraHealthPercent, gpsHealthPercent,
            avgEdgeInferenceFps, queueDepth, apiLatencyMs, ingestionRateEventsPerSec,
            dbHealthStatus, cloudSyncStatus, simulatedAt
        ) VALUES (1, 105, 101, 98.6, 99.4, 29.4, 3, 14.2, 88.6, ?, 'Synchronized (Multi-Layer Sensing Bus)', ?)
    """, (f"Operational ({db_type.upper()} Engine)", now.strftime("%Y-%m-%d %H:%M:%S")))

    conn.commit()
    conn.close()
    print(f"[Seed Demo] UrbanPulse AI Demo Data successfully seeded into {db_type.upper()}.")

if __name__ == "__main__":
    seed_demo_data()
