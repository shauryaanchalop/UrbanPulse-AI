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
        "activeBusesCount": 5,
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
        "activeBusesCount": 4,
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
        "activeBusesCount": 4,
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
        "activeBusesCount": 3,
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
        "activeBusesCount": 4,
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

def seed_demo_data():
    db_type = get_db_type()
    print(f"[Seed Demo] Seeding UrbanPulse AI Demo Data (Database Mode: {db_type.upper()})...")

    conn = get_db_connection()
    create_all_tables(conn)

    cur = conn.cursor()

    # Truncate / Clear existing table rows in safe order
    tables = list(TABLE_DEFINITIONS.keys())
    for tbl in tables:
        try:
            cur.execute(f"DELETE FROM {tbl}")
        except Exception as e:
            print(f"[Seed Demo] Warning clearing {tbl}:", e)
    conn.commit()

    now = datetime.now()

    # 1. Seed Routes
    for r in BASE_ROUTES:
        cur.execute("""
            INSERT INTO routes (id, name, corridor, totalDistanceKm, activeBusesCount, avgSpeedKmH, congestionLevel, waypoints)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["name"], r["corridor"], r["totalDistanceKm"],
            r["activeBusesCount"], r["avgSpeedKmH"], r["congestionLevel"],
            json.dumps(r["waypoints"])
        ))

    # 2. Seed 30 Buses
    bus_counter = 1
    for r in BASE_ROUTES:
        wps = r["waypoints"]
        num_buses = r["activeBusesCount"]
        for b_idx in range(num_buses):
            bus_id = f"BUS-{bus_counter:03d}"
            fleet_num = f"MH-12-RN-{1000 + bus_counter}"
            start_wp = b_idx % len(wps)
            next_wp = (start_wp + 1) % len(wps)
            frac = random.uniform(0.1, 0.8)
            lat = wps[start_wp]["lat"] + frac * (wps[next_wp]["lat"] - wps[start_wp]["lat"])
            lng = wps[start_wp]["lng"] + frac * (wps[next_wp]["lng"] - wps[start_wp]["lng"])
            speed = round(random.uniform(18.0, 42.0), 1)
            heading = round(random.uniform(0, 359), 1)

            status = "Active"
            if bus_counter in [8, 22]:
                status = "Warning"
            elif bus_counter in [15]:
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
                "Waterlogging patch tagged"
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

    # 3. Seed 10 Service Vehicles
    service_vehicles_data = [
        ("MS-01", "MH-12-PMC-101", "PMC Sanitation Dept", "Sanitation Vehicle", 18.5912, 73.7389, "Active"),
        ("MS-02", "MH-12-PMC-102", "PMC Road Works", "Road Inspection Truck", 18.5583, 73.8074, "Active"),
        ("MS-03", "MH-12-PMC-103", "PMC Water Supply", "Utility Tanker", 18.5039, 73.8288, "Active"),
        ("MS-04", "MH-12-PMC-104", "PMC Waste Mgmt", "Refuse Collector", 18.5204, 73.8567, "Active"),
        ("MS-05", "MH-12-PMC-105", "PMC Maintenance", "Light Repair Van", 18.5441, 73.8862, "Active"),
        ("MS-06", "MH-12-PMC-106", "PMC Enforcement", "Traffic Survey Patrol", 18.4575, 73.8588, "Active"),
        ("MS-07", "MH-12-PMC-107", "PMC Sanitation", "Sweeper Vehicle", 18.5590, 73.7868, "Active"),
        ("MS-08", "MH-12-PMC-108", "PMC Engineering", "Smart Survey Rover", 18.5135, 73.9312, "Standby"),
        ("MS-09", "MH-12-PMC-109", "PMC Pothole Squad", "Patching Vehicle", 18.5529, 73.9482, "Active"),
        ("MS-10", "MH-12-PMC-110", "PMC Electrical", "Streetlight Repair Crane", 18.6538, 73.7712, "Active")
    ]
    for sv in service_vehicles_data:
        cur.execute("""
            INSERT INTO service_vehicles (id, vehicleCode, department, vehicleType, latitude, longitude, speed, status, currentMissionId, lastActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sv[0], sv[1], sv[2], sv[3], sv[4], sv[5], random.uniform(15, 30), sv[6], None, now.strftime("%Y-%m-%d %H:%M:%S")))

    # 4. Seed 30 Road Segments
    sectors = ["Sector 12 - Wakad", "Sector 18 - Aundh", "Sector 04 - Kothrud", "Sector 21 - Swargate", "Sector 09 - Viman Nagar", "Sector 15 - Baner"]
    segment_names = [
        "Wakad Bridge Flyover Ramp", "Aundh Bremen Chowk Spine", "Karve Road Metro Corridor",
        "Satara Road Swargate Underpass", "Nagar Road Yerawada Junction", "Baner High Street Link",
        "University Circle Radial", "Hinjawadi Phase 1 Loop", "Hadapsar Magarpatta Connector",
        "Kalyani Nagar Riverside Lane", "Pimpri Railway Overbridge", "Khadki Cantonment Passage",
        "Old Mumbai Highway Sector 14", "Pashan Sus Narrow Gully", "Lohegaon Airport VIP Way"
    ]

    for i in range(1, 31):
        seg_id = f"SEG-{i:03d}"
        sname = segment_names[i % len(segment_names)] + f" (Block {i})"
        sec = sectors[i % len(sectors)]
        
        if i in [3, 7, 14]:
            cond = "Critical"
            health = random.randint(20, 42)
            cov = "RECENTLY_OBSERVED"
            def_cnt = random.randint(3, 6)
        elif i in [5, 11, 18, 22]:
            cond = "Attention"
            health = random.randint(45, 68)
            cov = "RECENTLY_OBSERVED"
            def_cnt = random.randint(1, 3)
        elif i in [8, 19, 27]:
            cond = "Degrading"
            health = random.randint(70, 79)
            cov = "AGING_OBSERVATION"
            def_cnt = 1
        elif i in [12, 25, 29]:
            cond = "Unknown"
            health = 50
            cov = "UNOBSERVED"
            def_cnt = 0
        else:
            cond = "Healthy"
            health = random.randint(85, 99)
            cov = "RECENTLY_OBSERVED"
            def_cnt = 0

        base_lat = 18.5204 + random.uniform(-0.08, 0.08)
        base_lng = 73.8567 + random.uniform(-0.08, 0.08)
        coords = [
            {"lat": base_lat, "lng": base_lng},
            {"lat": base_lat + random.uniform(-0.005, 0.005), "lng": base_lng + random.uniform(-0.005, 0.005)}
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

    # 5. Seed 120 Road Defects
    defect_types = ["Pothole", "Waterlogging", "Damaged Sign", "Missing Road Marking", "Broken Divider", "Surface Cracking"]
    severities = ["Critical", "High", "Medium", "Low"]
    addresses = [
        "Wakad Flyover Ramp, Hinjawadi Road", "Bremen Chowk, Aundh", "Pune University Circle North",
        "Deccan Gymkhana Karve Statue", "Yerawada Bridge Southbound", "Viman Nagar Symbiosis Chowk",
        "Katraj Bypass Junction", "Swargate ST Stand Gate", "Baner High Street Crossway",
        "Hadapsar Magarpatta North Gate", "Kalyani Nagar Jogger's Park Road", "Pimpri Railway Overbridge"
    ]

    for d_idx in range(1, 121):
        def_id = f"DEF-{d_idx:04d}"
        dtype = random.choice(defect_types)
        sev = random.choices(severities, weights=[0.25, 0.45, 0.25, 0.05])[0] if dtype == "Pothole" else random.choices(severities, weights=[0.1, 0.3, 0.45, 0.15])[0]
        r_choice = random.choice(BASE_ROUTES)
        wp = random.choice(r_choice["waypoints"])
        d_lat = wp["lat"] + random.uniform(-0.01, 0.01)
        d_lng = wp["lng"] + random.uniform(-0.01, 0.01)
        addr = random.choice(addresses)

        times_confirmed = 1
        cross_buses = [f"BUS-{(d_idx % 30) + 1:03d}"]
        confidence = round(random.uniform(0.75, 0.88), 2)
        status = "Reported"

        if d_idx % 3 == 0:
            times_confirmed = random.randint(2, 5)
            cross_buses = [f"BUS-{(d_idx + i) % 30 + 1:03d}" for i in range(times_confirmed)]
            confidence = round(random.uniform(0.92, 0.98), 2)
            status = "Cross-verified"
        elif d_idx % 5 == 0:
            times_confirmed = random.randint(2, 4)
            cross_buses = [f"BUS-{(d_idx + i) % 30 + 1:03d}" for i in range(times_confirmed)]
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
            f"/evidence/road_defect_{d_idx % 12 + 1}.jpg", dims, json.dumps(cross_buses), f"SEG-{(d_idx % 30) + 1:03d}"
        ))

    # 6. Seed 15 Citizen Reports
    citizen_samples = [
        ("UP-2026-000421", "Rahul Sharma", "Road Problem", 18.5912, 73.7389, "Deep severe pothole near Wakad bridge exit causing sharp braking", "RECEIVED", "Pothole", 0.91, "High", 10),
        ("UP-2026-000422", "Priya Verma", "Safety / Distress", 18.5039, 73.8288, "Broken streetlights and unsafe dark corner near Deccan Metro station", "VERIFIED", "Public Safety Threat", 0.88, "Medium", 25),
        ("UP-2026-000423", "Amit Deshmukh", "Accident / Incident", 18.5204, 73.8567, "Collision between two-wheeler and divider at Swargate square", "ASSIGNED", "Vehicle Accident", 0.95, "Critical", 50),
        ("UP-2026-000424", "Neha Kulkarni", "Traffic Issue", 18.5441, 73.8862, "Faulty signal causing severe gridlock on Yerawada junction", "REPAIR_IN_PROGRESS", "Signal Malfunction", 0.89, "High", 25),
        ("UP-2026-000425", "Vikram Patil", "Road Problem", 18.5583, 73.8074, "Waterlogging accumulating on Aundh road after rain", "VERIFIED_REPAIR", "Waterlogging", 0.93, "Medium", 35)
    ]
    for cs in citizen_samples:
        cur.execute("""
            INSERT INTO citizen_reports (
                id, referenceNo, reporterName, category, latitude, longitude, address, description,
                photoUrl, status, aiClassification, aiConfidence, aiSeverity, pointsAwarded, submittedAt, verificationSourcesCount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"REP-{cs[0]}", cs[0], cs[1], cs[2], cs[3], cs[4], f"{cs[2]} at {cs[3]:.4f}, {cs[4]:.4f}", cs[5],
            f"/evidence/road_defect_{random.randint(1, 8)}.jpg", cs[6], cs[7], cs[8], cs[9], cs[10],
            (now - timedelta(hours=random.randint(1, 48))).strftime("%Y-%m-%d %H:%M:%S"), random.randint(2, 4)
        ))

    # 7. Seed Reward Accounts
    reward_users = [
        ("USR-001", "Rahul Sharma", "Rahul S.", 1450, "Gold", ["Road Watcher", "Safety Reporter", "Urban Sentinel"], 18, 14, 92, 1),
        ("USR-002", "Priya Verma", "Priya V.", 1120, "Silver", ["Road Watcher", "Community Monitor"], 14, 10, 84, 2),
        ("USR-003", "Amit Deshmukh", "Amit D.", 980, "Silver", ["Safety Reporter"], 11, 9, 78, 3),
        ("USR-004", "Neha Kulkarni", "Neha K.", 760, "Bronze", ["Road Watcher"], 9, 7, 71, 4),
        ("USR-005", "Vikram Patil", "Vikram P.", 540, "Bronze", ["Community Monitor"], 6, 4, 62, 5)
    ]
    for ru in reward_users:
        cur.execute("""
            INSERT INTO reward_accounts (userId, userName, displayName, points, level, badges, reportCount, verifiedReportCount, impactScore, rank)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ru[0], ru[1], ru[2], ru[3], ru[4], json.dumps(ru[5]), ru[6], ru[7], ru[8], ru[9]))

    # 8. Seed Reward Rules
    reward_rules_data = [
        ("RUL-01", "VALID_REPORT", 10, "Awarded when citizen report passes initial AI validity check", 1),
        ("RUL-02", "VERIFIED_DEFECT", 25, "Awarded when report is independently confirmed by fleet sensor or operator", 1),
        ("RUL-03", "CRITICAL_INCIDENT", 50, "Awarded for actionable critical safety/hazard alerts", 1),
        ("RUL-04", "REPAIR_CONFIRMATION", 20, "Awarded when citizen photo verifies municipal repair work", 1),
        ("RUL-05", "SPAM_SUBMISSION", 0, "Zero points for duplicate, non-actionable or invalid reports", 1)
    ]
    for rr in reward_rules_data:
        cur.execute("INSERT INTO reward_rules (id, event, points, description, enabled) VALUES (?, ?, ?, ?, ?)", rr)

    # 9. Seed Traffic Events
    corridors = [
        ("Wakad-Hinjawadi Flyover Spine", 18.5985, 73.7621),
        ("Pune University Grade Separator", 18.5362, 73.8301),
        ("Karve Road Nal Stop Metro Corridor", 18.5039, 73.8288),
        ("Yerawada Chowk Nagar Road", 18.5441, 73.8862),
        ("Swargate Multimodal Junction", 18.5018, 73.8586)
    ]
    for t_idx in range(1, 41):
        corr, clat, clng = random.choice(corridors)
        t_lat = clat + random.uniform(-0.008, 0.008)
        t_lng = clng + random.uniform(-0.008, 0.008)
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
            random.randint(120, 850), f"BUS-{(t_idx % 30) + 1:03d}",
            (now - timedelta(minutes=random.randint(1, 120))).strftime("%Y-%m-%d %H:%M:%S"), density
        ))

    # 10. Seed Safety Incidents
    safety_data = [
        ("Rash Driving", "Critical", "Commercial transport swerving into oncoming BRTS transit lane at high speed"),
        ("Dangerous Pedestrian Proximity", "High", "Pedestrian stepped into blind spot outside zebra marker"),
        ("Near Collision", "High", "Two-wheeler abrupt cut across bus front bumper without signaling"),
        ("Hit & Run Alert", "Critical", "Compact car collided with stationary divider and fled west towards highway"),
        ("Sudden Lane Swerve", "Medium", "Private bus sudden lane deviation forcing rear traffic braking")
    ]
    for s_idx in range(1, 31):
        itype, isev, idesc = random.choice(safety_data)
        r_choice = random.choice(BASE_ROUTES)
        wp = random.choice(r_choice["waypoints"])
        bus_id = f"BUS-{(s_idx % 30) + 1:03d}"
        plate_str = f"UP-16-AB-{1000 + s_idx * 27}"

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
            wp["lat"] + random.uniform(-0.007, 0.007), wp["lng"] + random.uniform(-0.007, 0.007),
            f"{wp['name']} Environs", (now - timedelta(minutes=random.randint(5, 480))).strftime("%Y-%m-%d %H:%M:%S"),
            bus_id, r_choice["id"], random.choice(["Detected", "Verified", "Escalated to Police", "Resolved"]),
            f"Vehicle ({plate_str})", idesc, f"/evidence/clip_event_{s_idx % 6 + 1}.mp4",
            f"/evidence/incident_frame_{s_idx % 8 + 1}.jpg", json.dumps(anpr_dict),
            "AI flagged for operator verification"
        ))

    # 11. Seed Distress Alerts
    distress_samples = [
        ("ALT-001", "DIS-8821", "Ananya Deshmukh", "PERSONAL SAFETY", 18.5362, 73.8301, "University Circle Gate", "ACTIVE", "BUS-004", "PCR Van #12"),
        ("ALT-002", "DIS-8822", "Pooja Rao", "HARASSMENT", 18.5039, 73.8288, "Deccan Gymkhana Bus Stop", "ACKNOWLEDGED", "BUS-012", "PCR Patrol #04"),
        ("ALT-003", "DIS-8823", "Sunita Nair", "MEDICAL", 18.5204, 73.8567, "Pune Station South Exit", "DISPATCHED", "BUS-008", "Ambulance Unit 09")
    ]
    for da in distress_samples:
        cur.execute("""
            INSERT INTO distress_alerts (id, alertCode, citizenName, category, latitude, longitude, address, timestamp, status, mediaUrl, nearestBusId, nearestResponseUnit, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (da[0], da[1], da[2], da[3], da[4], da[5], da[6], now.strftime("%Y-%m-%d %H:%M:%S"), da[7], "/evidence/incident_frame_1.jpg", da[8], da[9], "Emergency visual tracking assigned to nearest transit vehicle"))

    # 12. Seed ANPR Detections
    for a_idx in range(1, 41):
        plate_str = f"UP-16-AB-{1000 + a_idx * 13}"
        cur.execute("""
            INSERT INTO anpr_detections (
                id, plateNumber, rawPlateText, vehicleType, confidence, color, speedEstimated,
                latitude, longitude, timestamp, busId, flaggedReason, demoOcrCropUrl
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"ANPR-{a_idx:04d}", plate_str, plate_str, "Sedan", round(random.uniform(0.88, 0.99), 2),
            random.choice(["White", "Black", "Silver", "Red", "Blue"]), round(random.uniform(25.0, 65.0), 1),
            18.5204 + random.uniform(-0.05, 0.05), 73.8567 + random.uniform(-0.05, 0.05),
            (now - timedelta(minutes=random.randint(1, 180))).strftime("%Y-%m-%d %H:%M:%S"),
            f"BUS-{(a_idx % 30) + 1:03d}", "Routine Traffic Sensing", f"/evidence/anpr_crop_{a_idx % 8 + 1}.jpg"
        ))

    # 13. Seed Vehicle Watchlist & Matches
    watchlist_items = [
        ("WTL-001", "VEH-901", "UP-16-AB-1234", "Suspected involvement in commercial hit and run incident", "Traffic Police Investigations", 1, "2026-01-01", "2026-12-31", "High priority alert", "Officer D. K. Shinde"),
        ("WTL-002", "VEH-902", "MH-12-PQ-9988", "Unauthorized BRTS transit lane intrusion repeat offender", "RTO Enforcement", 1, "2026-02-01", "2026-12-31", "Automated ticket flag", "Inspector V. R. Thorat")
    ]
    for w in watchlist_items:
        cur.execute("""
            INSERT INTO vehicle_watchlist (id, vehicleId, plateNumber, reason, department, active, validFrom, validUntil, notes, addedBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, w)

    cur.execute("""
        INSERT INTO watchlist_matches (id, watchlistId, plateNumber, detectedByBusId, timestamp, latitude, longitude, address, confidence, evidenceImageUrl, status, reviewedBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "MAT-001", "WTL-001", "UP-16-AB-1234", "BUS-004", (now - timedelta(minutes=14)).strftime("%Y-%m-%d %H:%M:%S"),
        18.5912, 73.7389, "Wakad Bridge Ramp", 0.94, "/evidence/anpr_crop_1.jpg", "POTENTIAL_MATCH", None
    ))

    # 14. Seed Survey Missions
    survey_missions_data = [
        ("MIS-024", "MISSION #024", "Sector 18 - Aundh", json.dumps(["SEG-012", "SEG-025"]), "HIGH", "No recent bus observation in 14 days, 3 citizen reports received near school zone", "MS-08", "MS-08", "PENDING", now.strftime("%Y-%m-%d %H:%M:%S")),
        ("MIS-025", "MISSION #025", "Sector 15 - Baner", json.dumps(["SEG-029"]), "MEDIUM", "Narrow gully lane unreached by standard transit bus routes", "MS-02", "MS-02", "ASSIGNED", now.strftime("%Y-%m-%d %H:%M:%S"))
    ]
    for sm in survey_missions_data:
        cur.execute("""
            INSERT INTO survey_missions (id, missionCode, sector, roadSegmentIds, priority, reason, recommendedVehicleId, assignedVehicleCode, status, assignedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sm)

    # 15. Seed Video Clips
    for v_idx in range(1, 21):
        cur.execute("""
            INSERT INTO video_clips (
                id, busId, cameraName, startTime, endTime, latitude, longitude, address,
                videoUrl, thumbnailUrl, relevanceScore, matchedEvents
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"CLIP-{v_idx:04d}", f"BUS-{(v_idx % 30) + 1:03d}", "front",
            (now - timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
            (now - timedelta(minutes=28)).strftime("%Y-%m-%d %H:%M:%S"),
            18.5204 + random.uniform(-0.04, 0.04), 73.8567 + random.uniform(-0.04, 0.04),
            "Transit Corridor Segment", f"/evidence/clip_event_{v_idx % 6 + 1}.mp4",
            f"/evidence/incident_frame_{v_idx % 8 + 1}.jpg", round(random.uniform(0.78, 0.98), 2),
            json.dumps(["POTHOLE_DETECTION", "TRAFFIC_DENSITY"])
        ))

    # 16. Seed Maintenance Tickets
    contractors = ["Pune Smart Infra Ltd", "PMC Road Works Dept", "Apex Asphalt & Civil Repairs"]
    for m_idx in range(1, 41):
        def_code = f"DEF-{m_idx:04d}"
        t_code = f"TKT-2026-{1000 + m_idx}"
        dtype = random.choice(["Pothole", "Waterlogging", "Damaged Sign", "Missing Road Marking", "Broken Divider"])
        sev = random.choice(["Critical", "High", "Medium", "Low"])
        prio = "P1" if sev == "Critical" else ("P2" if sev == "High" else "P3")
        stat = random.choices(["DETECTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "PENDING_VERIFICATION", "RE_VERIFIED"], weights=[0.2, 0.2, 0.2, 0.2, 0.1, 0.05, 0.05])[0]

        rep_date = now - timedelta(days=random.randint(1, 10))
        target_date = rep_date + timedelta(days=3 if prio in ["P1", "P2"] else 7)
        r_choice = random.choice(BASE_ROUTES)
        wp = random.choice(r_choice["waypoints"])

        cur.execute("""
            INSERT INTO maintenance_tickets (
                id, ticketCode, defectId, defectType, priority, severity, latitude, longitude,
                address, reportedAt, targetResolutionDate, status, assignedContractor, assignedDepartment,
                confirmingBusesCount, estimatedCostInr, evidenceImageUrl, resolutionNotes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"MNT-{m_idx:04d}", t_code, def_code, dtype, prio, sev,
            wp["lat"] + random.uniform(-0.008, 0.008), wp["lng"] + random.uniform(-0.008, 0.008),
            f"{wp['name']} Corridor Sector", rep_date.strftime("%Y-%m-%d %H:%M:%S"), target_date.strftime("%Y-%m-%d %H:%M:%S"),
            stat, random.choice(contractors), "Road Infrastructure Maintenance Dept", random.randint(2, 5),
            random.randint(15000, 145000), f"/evidence/road_defect_{m_idx % 12 + 1}.jpg",
            "Dispatched asphalt repair squad" if stat in ["IN_PROGRESS", "COMPLETED", "RE_VERIFIED"] else None
        ))

    # 17. Seed System Users & Roles
    users_data = [
        ("USR-ADM-01", "superadmin", "System Administrator", "SUPER ADMIN", "IT & Governance", "admin@urbanpulse.ai"),
        ("USR-OP-01", "operator1", "Command Center Dispatcher", "ICCC OPERATOR", "Smart City ICCC Ops", "ops@urbanpulse.ai"),
        ("USR-ENG-01", "engineer1", "Senior Road Infrastructure Engineer", "ROAD ENGINEER", "PMC Public Works", "eng@urbanpulse.ai"),
        ("USR-POL-01", "investigator1", "Traffic Police Special Investigator", "POLICE / AUTHORIZED INVESTIGATOR", "Urban Traffic Police", "police@urbanpulse.ai"),
        ("USR-FLT-01", "fleetmgr1", "PMPML Fleet Supervisor", "FLEET OPERATOR", "PMPML Transit Ops", "fleet@urbanpulse.ai"),
        ("USR-CIT-01", "rahul_s", "Rahul Sharma", "CITIZEN", "Public Citizen", "rahul@gmail.com")
    ]
    for u in users_data:
        cur.execute("INSERT INTO users (id, username, fullName, role, department, email) VALUES (?, ?, ?, ?, ?, ?)", u)

    # 18. Seed Audit Logs
    cur.execute("""
        INSERT INTO audit_logs (id, userId, username, role, action, resource, details, timestamp, ipAddress)
        VALUES ('LOG-001', 'USR-POL-01', 'investigator1', 'POLICE / AUTHORIZED INVESTIGATOR', 'VIEW_EVIDENCE_CLIP', 'VideoClip #BUS-004-CAM-F', 'Accessed evidence clip for Case #AC-2026-0142', ?, '10.0.4.12')
    """, (now.strftime("%Y-%m-%d %H:%M:%S"),))

    # 19. Seed System Health
    cur.execute("""
        INSERT INTO system_health (
            id, activeBusesTotal, onlineBusesCount, cameraHealthPercent, gpsHealthPercent,
            avgEdgeInferenceFps, queueDepth, apiLatencyMs, ingestionRateEventsPerSec,
            dbHealthStatus, cloudSyncStatus, simulatedAt
        ) VALUES (1, 30, 28, 98.4, 99.2, 29.4, 3, 18.2, 42.6, ?, 'Synchronized (Multi-Layer Sensing Bus)', ?)
    """, (f"Operational ({db_type.upper()} Spatial Engine)", now.strftime("%Y-%m-%d %H:%M:%S")))

    # 20. Seed Notifications & Notification Rules
    default_rules = [
        ("rule-101", "CRITICAL_DEFECT", "Critical", "Road Engineering", "engineering@pune.gov.in", "+919822011223", 1, 1, 1),
        ("rule-102", "SAFETY_ACCIDENT", "High", "Police Command", "traffic.police@pune.gov.in", "+919822099887", 1, 1, 1),
        ("rule-103", "DISTRESS_ALERT", "Critical", "Women's Safety Cell", "distress.response@pune.gov.in", "+919822044556", 1, 1, 1),
        ("rule-104", "WATCHLIST_MATCH", "High", "Authorized Investigators", "anpr.unit@pune.gov.in", "+919822077889", 1, 0, 1)
    ]
    for r in default_rules:
        cur.execute("""
            INSERT INTO notification_rules (id, eventType, minSeverity, department, targetEmail, targetPhone, emailEnabled, smsEnabled, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    cur.execute("""
        INSERT INTO notifications (id, eventType, severity, department, title, message, targetEmail, targetPhone, channel, status, timestamp, metadataJson)
        VALUES ('notif-em-1001', 'CRITICAL_DEFECT', 'Critical', 'Road Engineering', 'Critical Pothole Flagged', 'Pothole DEF-0003 verified on Wakad Ramp', 'engineering@pune.gov.in', '+919822011223', 'EMAIL', 'SENT_DEMO', ?, '{}')
    """, (now.strftime("%Y-%m-%d %H:%M:%S"),))

    conn.commit()
    conn.close()
    print(f"[Seed Demo] UrbanPulse AI Demo Data successfully seeded into {db_type.upper()}.")

if __name__ == "__main__":
    seed_demo_data()
