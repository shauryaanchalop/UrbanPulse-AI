import sqlite3
import json
import random
import math
from datetime import datetime, timedelta

DB_PATH = "urbanpulse.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Realistic reference coordinates for Smart City (Pune Metropolitan Area)
# Center: 18.5204° N, 73.8567° E
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
    },
    {
        "id": "RT-106",
        "name": "Line 6: Kharadi EON IT Park - Kalyani Nagar - Swargate",
        "corridor": "Kharadi - Nagar Road - Swargate",
        "totalDistanceKm": 19.1,
        "activeBusesCount": 3,
        "avgSpeedKmH": 23.8,
        "congestionLevel": "High",
        "waypoints": [
            {"lat": 18.5529, "lng": 73.9482, "name": "EON IT Park Kharadi"},
            {"lat": 18.5463, "lng": 73.9034, "name": "Kalyani Nagar Bridge"},
            {"lat": 18.5350, "lng": 73.8750, "name": "Bund Garden"},
            {"lat": 18.5018, "lng": 73.8586, "name": "Swargate Hub"}
        ]
    },
    {
        "id": "RT-107",
        "name": "Line 7: Nigdi Pradhikaran - Pimpri - Aundh - Deccan",
        "corridor": "Old Mumbai-Pune Highway Spine",
        "totalDistanceKm": 22.8,
        "activeBusesCount": 3,
        "avgSpeedKmH": 29.5,
        "congestionLevel": "Low",
        "waypoints": [
            {"lat": 18.6538, "lng": 73.7712, "name": "Nigdi Pradhikaran Depot"},
            {"lat": 18.6279, "lng": 73.8131, "name": "Pimpri Station"},
            {"lat": 18.5721, "lng": 73.8052, "name": "Sangvi Bridge"},
            {"lat": 18.5039, "lng": 73.8288, "name": "Deccan Gymkhana"}
        ]
    },
    {
        "id": "RT-108",
        "name": "Line 8: Warje Malwadi - Paud Road - Shivajinagar",
        "corridor": "Warje - Karve Road Connector",
        "totalDistanceKm": 13.5,
        "activeBusesCount": 2,
        "avgSpeedKmH": 25.1,
        "congestionLevel": "Moderate",
        "waypoints": [
            {"lat": 18.4795, "lng": 73.7990, "name": "Warje Flyover"},
            {"lat": 18.4981, "lng": 73.8123, "name": "Karve Statue, Kothrud"},
            {"lat": 18.5314, "lng": 73.8446, "name": "Shivajinagar Interchange"}
        ]
    },
    {
        "id": "RT-109",
        "name": "Line 9: Bhosari MIDC - Nashik Phata - Pune Station",
        "corridor": "Bhosari Industrial Corridor",
        "totalDistanceKm": 17.3,
        "activeBusesCount": 2,
        "avgSpeedKmH": 30.0,
        "congestionLevel": "Moderate",
        "waypoints": [
            {"lat": 18.6189, "lng": 73.8481, "name": "Bhosari MIDC Chowk"},
            {"lat": 18.5991, "lng": 73.8262, "name": "Nashik Phata Interchange"},
            {"lat": 18.5441, "lng": 73.8562, "name": "Khadki Cantonment"},
            {"lat": 18.5204, "lng": 73.8567, "name": "Pune Station"}
        ]
    },
    {
        "id": "RT-110",
        "name": "Line 10: Airport Shuttle Express (Lohegaon - Deccan - Swargate)",
        "corridor": "Airport Transit Corridor",
        "totalDistanceKm": 20.4,
        "activeBusesCount": 2,
        "avgSpeedKmH": 33.4,
        "congestionLevel": "Low",
        "waypoints": [
            {"lat": 18.5822, "lng": 73.9197, "name": "Pune International Airport"},
            {"lat": 18.5612, "lng": 73.9011, "name": "Yerawada Mental Corner"},
            {"lat": 18.5204, "lng": 73.8567, "name": "Pune Station"},
            {"lat": 18.5018, "lng": 73.8586, "name": "Swargate Multimodal Hub"}
        ]
    }
]

def init_db():
    conn = get_db_connection()
    c = conn.cursor()

    # Drop tables to ensure fresh clean schema on startup
    c.execute("DROP TABLE IF EXISTS buses")
    c.execute("DROP TABLE IF EXISTS routes")
    c.execute("DROP TABLE IF EXISTS road_defects")
    c.execute("DROP TABLE IF EXISTS traffic_events")
    c.execute("DROP TABLE IF EXISTS safety_incidents")
    c.execute("DROP TABLE IF EXISTS anpr_detections")
    c.execute("DROP TABLE IF EXISTS maintenance_tickets")
    c.execute("DROP TABLE IF EXISTS system_health")

    # Create tables
    c.execute("""
    CREATE TABLE routes (
        id TEXT PRIMARY KEY,
        name TEXT,
        corridor TEXT,
        totalDistanceKm REAL,
        activeBusesCount INTEGER,
        avgSpeedKmH REAL,
        congestionLevel TEXT,
        waypoints TEXT
    )
    """)

    c.execute("""
    CREATE TABLE buses (
        id TEXT PRIMARY KEY,
        fleetNumber TEXT,
        routeId TEXT,
        routeName TEXT,
        status TEXT,
        latitude REAL,
        longitude REAL,
        speed REAL,
        heading REAL,
        cameraHealth TEXT,
        gpsHealth TEXT,
        networkStatus TEXT,
        edgeFps REAL,
        gpuUtilization INTEGER,
        lastEvent TEXT,
        lastUpdateTime TEXT,
        currentPassengerLoad INTEGER,
        cameras TEXT,
        currentWaypointIndex INTEGER DEFAULT 0,
        direction INTEGER DEFAULT 1
    )
    """)

    c.execute("""
    CREATE TABLE road_defects (
        id TEXT PRIMARY KEY,
        defectType TEXT,
        severity TEXT,
        confidence REAL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        routeId TEXT,
        detectedByBusId TEXT,
        firstSeen TEXT,
        lastSeen TEXT,
        timesConfirmed INTEGER,
        status TEXT,
        priority TEXT,
        evidenceImageUrl TEXT,
        dimensionsEstimated TEXT,
        crossVerifyingBuses TEXT
    )
    """)

    c.execute("""
    CREATE TABLE traffic_events (
        id TEXT PRIMARY KEY,
        corridorName TEXT,
        latitude REAL,
        longitude REAL,
        congestionLevel TEXT,
        averageSpeedKmH REAL,
        freeFlowSpeedKmH REAL,
        delayMinutes REAL,
        affectedVehiclesEstimate INTEGER,
        observedByBusId TEXT,
        timestamp TEXT,
        densityScore REAL
    )
    """)

    c.execute("""
    CREATE TABLE safety_incidents (
        id TEXT PRIMARY KEY,
        incidentType TEXT,
        severity TEXT,
        confidence REAL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        timestamp TEXT,
        busId TEXT,
        routeId TEXT,
        status TEXT,
        trackedObject TEXT,
        eventDescription TEXT,
        videoRefUrl TEXT,
        evidenceImageUrl TEXT,
        anprInfo TEXT,
        actionTaken TEXT
    )
    """)

    c.execute("""
    CREATE TABLE anpr_detections (
        id TEXT PRIMARY KEY,
        plateNumber TEXT,
        vehicleType TEXT,
        confidence REAL,
        color TEXT,
        speedEstimated REAL,
        latitude REAL,
        longitude REAL,
        timestamp TEXT,
        busId TEXT,
        flaggedReason TEXT,
        demoOcrCropUrl TEXT
    )
    """)

    c.execute("""
    CREATE TABLE maintenance_tickets (
        id TEXT PRIMARY KEY,
        ticketCode TEXT,
        defectId TEXT,
        defectType TEXT,
        priority TEXT,
        severity TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        reportedAt TEXT,
        targetResolutionDate TEXT,
        status TEXT,
        assignedContractor TEXT,
        confirmingBusesCount INTEGER,
        estimatedCostInr INTEGER,
        evidenceImageUrl TEXT,
        resolutionNotes TEXT
    )
    """)

    c.execute("""
    CREATE TABLE system_health (
        id INTEGER PRIMARY KEY,
        activeBusesTotal INTEGER,
        onlineBusesCount INTEGER,
        cameraHealthPercent REAL,
        gpsHealthPercent REAL,
        avgEdgeInferenceFps REAL,
        queueDepth INTEGER,
        apiLatencyMs REAL,
        ingestionRateEventsPerSec REAL,
        dbHealthStatus TEXT,
        cloudSyncStatus TEXT,
        simulatedAt TEXT
    )
    """)

    # Seed Routes
    for r in BASE_ROUTES:
        c.execute("""
        INSERT INTO routes (id, name, corridor, totalDistanceKm, activeBusesCount, avgSpeedKmH, congestionLevel, waypoints)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["name"], r["corridor"], r["totalDistanceKm"],
            r["activeBusesCount"], r["avgSpeedKmH"], r["congestionLevel"],
            json.dumps(r["waypoints"])
        ))

    # Seed 32 Buses
    now = datetime.now()
    bus_counter = 1
    for r in BASE_ROUTES:
        wps = r["waypoints"]
        num_buses = r["activeBusesCount"]
        for b_idx in range(num_buses):
            bus_id = f"BUS-{bus_counter:03d}"
            fleet_num = f"MH-12-RN-{1000 + bus_counter}"
            # place bus at a fractional position along route waypoints
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
            elif bus_counter in [29]:
                status = "Maintenance"

            cameras = [
                {"id": f"{bus_id}-CAM-F", "name": "front", "status": "active", "resolution": "1080p", "fps": 30.0},
                {"id": f"{bus_id}-CAM-R", "name": "rear", "status": "active", "resolution": "1080p", "fps": 25.0},
                {"id": f"{bus_id}-CAM-L", "name": "left", "status": "active", "resolution": "720p", "fps": 25.0},
                {"id": f"{bus_id}-CAM-RT", "name": "right", "status": "active", "resolution": "720p", "fps": 25.0}
            ]

            last_events = [
                "Pothole classified with 93% conf",
                "Pedestrian proximity threshold monitored",
                "Traffic density metadata transmitted",
                "Lane boundary defect detected",
                "Number plate logged: MH-14-GH-4921",
                "Waterlogging patch tagged"
            ]

            c.execute("""
            INSERT INTO buses (
                id, fleetNumber, routeId, routeName, status, latitude, longitude, speed, heading,
                cameraHealth, gpsHealth, networkStatus, edgeFps, gpuUtilization, lastEvent,
                lastUpdateTime, currentPassengerLoad, cameras, currentWaypointIndex, direction
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                bus_id, fleet_num, r["id"], r["name"], status, lat, lng, speed, heading,
                "Optimal" if status != "Warning" else "Minor Glitch (CAM-R)",
                "High Accuracy (RTK)", "5G Connected",
                round(random.uniform(28.5, 30.2), 1), random.randint(45, 78),
                random.choice(last_events),
                (now - timedelta(seconds=random.randint(2, 45))).strftime("%Y-%m-%d %H:%M:%S"),
                random.randint(18, 55), json.dumps(cameras), start_wp, 1
            ))
            bus_counter += 1

    # Seed 160 Road Defects
    defect_types = ["Pothole", "Waterlogging", "Damaged Sign", "Missing Road Marking", "Broken Divider", "Surface Cracking"]
    severities = ["Critical", "High", "Medium", "Low"]
    road_addresses = [
        "Wakad Flyover Ramp, Hinjawadi Road", "Bremen Chowk, Aundh", "Pune University Circle North",
        "Deccan Gymkhana Karve Statue", "Yerawada Bridge Southbound", "Viman Nagar Symbiosis Chowk",
        "Katraj Bypass Junction", "Swargate ST Stand Gate", "Baner High Street Crossway",
        "Hadapsar Magarpatta North Gate", "Kalyani Nagar Jogger's Park Road", "Pimpri Railway Overbridge",
        "Old Mumbai Highway Khadki", "Senapati Bapat Road ICC Trade Tower", "Bund Garden Bridge Approach",
        "Pashan Sus Road Underpass", "Nigdi Pradhikaran Sector 24", "Warje Malwadi Flyover Exit",
        "Bhosari MIDC Telco Road", "Lohegaon Airport VIP Link Road"
    ]

    for d_idx in range(1, 161):
        def_id = f"DEF-{d_idx:04d}"
        dtype = random.choice(defect_types)
        # assign severity
        if dtype in ["Pothole", "Broken Divider"]:
            sev = random.choices(severities, weights=[0.25, 0.45, 0.25, 0.05])[0]
        else:
            sev = random.choices(severities, weights=[0.10, 0.30, 0.45, 0.15])[0]

        # associate with route
        r_choice = random.choice(BASE_ROUTES)
        wps = r_choice["waypoints"]
        wp = random.choice(wps)
        # add small random jitter
        d_lat = wp["lat"] + random.uniform(-0.012, 0.012)
        d_lng = wp["lng"] + random.uniform(-0.012, 0.012)
        addr = random.choice(road_addresses) + f" (KM {random.randint(2, 22)}.{random.randint(1, 9)})"

        # Multi-bus verification simulation for ~40% of defects
        times_confirmed = 1
        cross_buses = [f"BUS-{(d_idx % 30) + 1:03d}"]
        confidence = round(random.uniform(0.74, 0.88), 2)
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

        priority = "P3"
        if sev == "Critical" and times_confirmed >= 2:
            priority = "P1"
        elif sev in ["Critical", "High"]:
            priority = "P2"
        elif sev == "Low":
            priority = "P4"

        first_seen = (now - timedelta(days=random.randint(1, 14), hours=random.randint(1, 8))).strftime("%Y-%m-%d %H:%M:%S")
        last_seen = (now - timedelta(minutes=random.randint(5, 360))).strftime("%Y-%m-%d %H:%M:%S")
        dims = f"{random.randint(25, 85)}cm x {random.randint(20, 60)}cm, {random.randint(4, 14)}cm depth" if dtype == "Pothole" else None

        c.execute("""
        INSERT INTO road_defects (
            id, defectType, severity, confidence, latitude, longitude, address, routeId,
            detectedByBusId, firstSeen, lastSeen, timesConfirmed, status, priority,
            evidenceImageUrl, dimensionsEstimated, crossVerifyingBuses
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            def_id, dtype, sev, confidence, d_lat, d_lng, addr, r_choice["id"],
            cross_buses[0], first_seen, last_seen, times_confirmed, status, priority,
            f"/evidence/road_defect_{d_idx % 12 + 1}.jpg", dims, json.dumps(cross_buses)
        ))

    # Seed 60 Traffic Events
    corridors = [
        ("Wakad-Hinjawadi Flyover Spine", 18.5985, 73.7621),
        ("Pune University Grade Separator", 18.5362, 73.8301),
        ("Karve Road Nal Stop Metro Corridor", 18.5039, 73.8288),
        ("Yerawada Chowk Nagar Road", 18.5441, 73.8862),
        ("Swargate Multimodal Junction", 18.5018, 73.8586),
        ("Hadapsar Gadital Chhatrapati Shivaji Chowk", 18.5135, 73.9312),
        ("Baner High Street - Balewadi Phata", 18.5590, 73.7868),
        ("Pimpri Ambedkar Chowk Old Highway", 18.6279, 73.8131)
    ]
    for t_idx in range(1, 61):
        corr, clat, clng = random.choice(corridors)
        t_lat = clat + random.uniform(-0.008, 0.008)
        t_lng = clng + random.uniform(-0.008, 0.008)
        cong = random.choices(["Low", "Moderate", "Heavy", "Standstill"], weights=[0.2, 0.45, 0.25, 0.1])[0]
        avg_spd = 12.0 if cong == "Standstill" else (18.5 if cong == "Heavy" else (26.0 if cong == "Moderate" else 38.0))
        delay = round(max(1.0, (45.0 - avg_spd) * 0.45), 1)
        density = round(min(0.98, max(0.2, (50.0 - avg_spd) / 45.0)), 2)
        bus_obs = f"BUS-{(t_idx % 30) + 1:03d}"

        c.execute("""
        INSERT INTO traffic_events (
            id, corridorName, latitude, longitude, congestionLevel, averageSpeedKmH,
            freeFlowSpeedKmH, delayMinutes, affectedVehiclesEstimate, observedByBusId,
            timestamp, densityScore
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"TRF-{t_idx:04d}", corr, t_lat, t_lng, cong, avg_spd, 45.0, delay,
            random.randint(120, 850), bus_obs,
            (now - timedelta(minutes=random.randint(1, 120))).strftime("%Y-%m-%d %H:%M:%S"),
            density
        ))

    # Seed 35 Safety Incidents
    incident_types = [
        ("Rash Driving", "Critical", "Commercial transport swerving into oncoming BRTS lane at high speed"),
        ("Dangerous Pedestrian Proximity", "High", "Pedestrian stepped into blind spot of transit vehicle while crossing outside zebra marker"),
        ("Near Collision", "High", "Two-wheeler abrupt cut across bus front bumper without signaling"),
        ("Hit & Run Alert", "Critical", "Compact car collided with stationary divider and fled west towards highway"),
        ("Sudden Lane Swerve", "Medium", "Private bus sudden lane deviation forcing rear traffic braking")
    ]
    plates_sample = [
        ("MH-12-DE-9104", "White SUV"),
        ("MH-14-AA-2391", "Silver Hatchback"),
        ("MH-12-KQ-7722", "Black Sedan"),
        ("MH-12-RT-4040", "Auto-Rickshaw"),
        ("DL-03-CB-8819", "Grey Pickup Truck")
    ]

    for s_idx in range(1, 36):
        itype, isev, idesc = random.choice(incident_types)
        r_choice = random.choice(BASE_ROUTES)
        wp = random.choice(r_choice["waypoints"])
        s_lat = wp["lat"] + random.uniform(-0.007, 0.007)
        s_lng = wp["lng"] + random.uniform(-0.007, 0.007)
        bus_id = f"BUS-{(s_idx % 30) + 1:03d}"
        plate, veh = random.choice(plates_sample)

        anpr_dict = {
            "plateNumber": plate,
            "vehicleType": veh,
            "confidence": round(random.uniform(0.88, 0.97), 2),
            "demoOcrCropUrl": f"/evidence/anpr_crop_{s_idx % 8 + 1}.jpg"
        }

        status = random.choice(["Detected", "Verified", "Escalated to Police", "Resolved"])
        action = "Forwarded evidence pack to Traffic Police Control" if status == "Escalated to Police" else "AI flagged for operator verification"

        c.execute("""
        INSERT INTO safety_incidents (
            id, incidentType, severity, confidence, latitude, longitude, address,
            timestamp, busId, routeId, status, trackedObject, eventDescription,
            videoRefUrl, evidenceImageUrl, anprInfo, actionTaken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"INC-{s_idx:04d}", itype, isev, round(random.uniform(0.85, 0.96), 2),
            s_lat, s_lng, f"{wp['name']} Environs",
            (now - timedelta(minutes=random.randint(5, 480))).strftime("%Y-%m-%d %H:%M:%S"),
            bus_id, r_choice["id"], status, f"{veh} ({plate})",
            idesc, f"/evidence/clip_event_{s_idx % 6 + 1}.mp4",
            f"/evidence/incident_frame_{s_idx % 8 + 1}.jpg",
            json.dumps(anpr_dict), action
        ))

    # Seed 25 ANPR Detections
    for a_idx in range(1, 26):
        plate, veh = random.choice(plates_sample)
        plate_str = f"MH-{random.randint(12, 14)}-{chr(65 + a_idx % 26)}{chr(65 + (a_idx * 3) % 26)}-{1000 + a_idx * 43}"
        r_choice = random.choice(BASE_ROUTES)
        wp = random.choice(r_choice["waypoints"])
        c.execute("""
        INSERT INTO anpr_detections (
            id, plateNumber, vehicleType, confidence, color, speedEstimated,
            latitude, longitude, timestamp, busId, flaggedReason, demoOcrCropUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"ANPR-{a_idx:04d}", plate_str, random.choice(["Car", "Motorcycle", "Auto-Rickshaw", "Truck"]),
            round(random.uniform(0.89, 0.98), 2), random.choice(["White", "Silver", "Black", "Red", "Blue"]),
            round(random.uniform(25.0, 68.0), 1),
            wp["lat"] + random.uniform(-0.005, 0.005), wp["lng"] + random.uniform(-0.005, 0.005),
            (now - timedelta(minutes=random.randint(2, 180))).strftime("%Y-%m-%d %H:%M:%S"),
            f"BUS-{(a_idx % 30) + 1:03d}",
            random.choice(["Speeding in Transit Lane", "Wrong-Way Entry", "Crosswalk Blocking", "None (Routine Tracking)"]),
            f"/evidence/anpr_crop_{a_idx % 8 + 1}.jpg"
        ))

    # Seed 80 Maintenance Tickets
    contractors = [
        "Pune Smart Infra Ltd (Zone 1)",
        "PMC Road Works Dept",
        "National Highway Infra Concessionaire",
        "Apex Asphalt & Civil Repairs",
        "Urban Road Maintenance Consortium"
    ]
    for m_idx in range(1, 81):
        def_code = f"DEF-{m_idx:04d}"
        t_code = f"TKT-2026-{1000 + m_idx}"
        dtype = random.choice(["Pothole", "Waterlogging", "Damaged Sign", "Missing Road Marking", "Broken Divider"])
        sev = random.choice(["Critical", "High", "Medium", "Low"])
        prio = "P1" if sev == "Critical" else ("P2" if sev == "High" else ("P3" if sev == "Medium" else "P4"))
        stat = random.choices(["Open", "Assigned", "In Progress", "Resolved", "Verified"], weights=[0.25, 0.25, 0.3, 0.15, 0.05])[0]
        
        rep_date = now - timedelta(days=random.randint(1, 10))
        target_date = rep_date + timedelta(days=3 if prio in ["P1", "P2"] else 7)
        r_choice = random.choice(BASE_ROUTES)
        wp = random.choice(r_choice["waypoints"])

        c.execute("""
        INSERT INTO maintenance_tickets (
            id, ticketCode, defectId, defectType, priority, severity, latitude, longitude,
            address, reportedAt, targetResolutionDate, status, assignedContractor,
            confirmingBusesCount, estimatedCostInr, evidenceImageUrl, resolutionNotes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"MNT-{m_idx:04d}", t_code, def_code, dtype, prio, sev,
            wp["lat"] + random.uniform(-0.008, 0.008), wp["lng"] + random.uniform(-0.008, 0.008),
            f"{wp['name']} Sector Corridor",
            rep_date.strftime("%Y-%m-%d %H:%M:%S"), target_date.strftime("%Y-%m-%d %H:%M:%S"),
            stat, random.choice(contractors), random.randint(2, 6),
            random.randint(15000, 185000), f"/evidence/road_defect_{m_idx % 12 + 1}.jpg",
            "Dispatched cold-mix asphalt repair team" if stat in ["In Progress", "Resolved"] else None
        ))

    # Seed System Health
    c.execute("""
    INSERT INTO system_health (
        id, activeBusesTotal, onlineBusesCount, cameraHealthPercent, gpsHealthPercent,
        avgEdgeInferenceFps, queueDepth, apiLatencyMs, ingestionRateEventsPerSec,
        dbHealthStatus, cloudSyncStatus, simulatedAt
    ) VALUES (1, 32, 30, 98.4, 99.2, 29.4, 4, 18.2, 42.6, 'Operational (SQLite WAL)', 'Synchronized (Simulated Edge Hub)', ?)
    """, (now.strftime("%Y-%m-%d %H:%M:%S"),))

    conn.commit()
    conn.close()
    print("UrbanPulse AI SQLite Database successfully initialized and seeded.")

if __name__ == "__main__":
    init_db()
