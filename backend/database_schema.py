from typing import List, Dict

TABLE_DEFINITIONS: Dict[str, str] = {
    "routes": """
        CREATE TABLE IF NOT EXISTS routes (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            corridor VARCHAR(255) NOT NULL,
            totalDistanceKm DOUBLE PRECISION NOT NULL,
            activeBusesCount INT DEFAULT 0,
            avgSpeedKmH DOUBLE PRECISION DEFAULT 0.0,
            congestionLevel VARCHAR(50) DEFAULT 'Low',
            waypoints TEXT NOT NULL
        )
    """,
    "buses": """
        CREATE TABLE IF NOT EXISTS buses (
            id VARCHAR(50) PRIMARY KEY,
            fleetNumber VARCHAR(50) NOT NULL,
            routeId VARCHAR(50) NOT NULL,
            routeName VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            speed DOUBLE PRECISION NOT NULL,
            heading DOUBLE PRECISION DEFAULT 0.0,
            cameraHealth VARCHAR(50) DEFAULT '100%',
            gpsHealth VARCHAR(50) DEFAULT '100%',
            networkStatus VARCHAR(50) DEFAULT '5G-ONLINE',
            edgeFps DOUBLE PRECISION DEFAULT 29.4,
            gpuUtilization INT DEFAULT 42,
            lastEvent VARCHAR(255),
            lastUpdateTime VARCHAR(50) NOT NULL,
            currentPassengerLoad INT DEFAULT 0,
            cameras TEXT NOT NULL,
            currentWaypointIndex INT DEFAULT 0,
            direction INT DEFAULT 1,
            vehicleType VARCHAR(100) DEFAULT 'Public Transit Bus'
        )
    """,
    "service_vehicles": """
        CREATE TABLE IF NOT EXISTS service_vehicles (
            id VARCHAR(50) PRIMARY KEY,
            vehicleCode VARCHAR(50) NOT NULL,
            department VARCHAR(100) NOT NULL,
            vehicleType VARCHAR(100) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            speed DOUBLE PRECISION NOT NULL,
            status VARCHAR(50) NOT NULL,
            currentMissionId VARCHAR(50),
            lastActive VARCHAR(50) NOT NULL
        )
    """,
    "road_segments": """
        CREATE TABLE IF NOT EXISTS road_segments (
            id VARCHAR(50) PRIMARY KEY,
            segmentId VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            sector VARCHAR(100) NOT NULL,
            healthScore DOUBLE PRECISION NOT NULL,
            condition VARCHAR(50) NOT NULL,
            lastObservedAt VARCHAR(50) NOT NULL,
            observationCount INT DEFAULT 0,
            defectCount INT DEFAULT 0,
            criticality VARCHAR(50) NOT NULL,
            coverageState VARCHAR(50) NOT NULL,
            openWorkOrders INT DEFAULT 0,
            coordinates TEXT NOT NULL,
            assignedVehicleType VARCHAR(100) NOT NULL
        )
    """,
    "road_defects": """
        CREATE TABLE IF NOT EXISTS road_defects (
            id VARCHAR(50) PRIMARY KEY,
            defectType VARCHAR(100) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            confidence DOUBLE PRECISION NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            routeId VARCHAR(50) NOT NULL,
            detectedByBusId VARCHAR(50) NOT NULL,
            firstSeen VARCHAR(50) NOT NULL,
            lastSeen VARCHAR(50) NOT NULL,
            timesConfirmed INT DEFAULT 1,
            status VARCHAR(50) NOT NULL,
            priority VARCHAR(20) NOT NULL,
            evidenceImageUrl TEXT,
            dimensionsEstimated VARCHAR(100),
            crossVerifyingBuses TEXT,
            segmentId VARCHAR(50)
        )
    """,
    "citizen_reports": """
        CREATE TABLE IF NOT EXISTS citizen_reports (
            id VARCHAR(50) PRIMARY KEY,
            referenceNo VARCHAR(50) NOT NULL,
            reporterName VARCHAR(100) NOT NULL,
            category VARCHAR(100) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            description TEXT,
            photoUrl TEXT,
            status VARCHAR(50) NOT NULL,
            aiClassification VARCHAR(100),
            aiConfidence DOUBLE PRECISION DEFAULT 0.0,
            aiSeverity VARCHAR(50) DEFAULT 'Low',
            pointsAwarded INT DEFAULT 0,
            submittedAt VARCHAR(50) NOT NULL,
            verificationSourcesCount INT DEFAULT 1
        )
    """,
    "reward_accounts": """
        CREATE TABLE IF NOT EXISTS reward_accounts (
            userId VARCHAR(50) PRIMARY KEY,
            userName VARCHAR(100) NOT NULL,
            displayName VARCHAR(100) NOT NULL,
            points INT DEFAULT 0,
            level VARCHAR(50) DEFAULT 'Bronze',
            badges TEXT,
            reportCount INT DEFAULT 0,
            verifiedReportCount INT DEFAULT 0,
            impactScore DOUBLE PRECISION DEFAULT 0.0,
            rank INT DEFAULT 1
        )
    """,
    "reward_transactions": """
        CREATE TABLE IF NOT EXISTS reward_transactions (
            id VARCHAR(50) PRIMARY KEY,
            userId VARCHAR(50) NOT NULL,
            reportId VARCHAR(50),
            points INT NOT NULL,
            reason VARCHAR(255) NOT NULL,
            timestamp VARCHAR(50) NOT NULL
        )
    """,
    "reward_rules": """
        CREATE TABLE IF NOT EXISTS reward_rules (
            id VARCHAR(50) PRIMARY KEY,
            event VARCHAR(100) NOT NULL,
            points INT NOT NULL,
            description TEXT NOT NULL,
            enabled INT DEFAULT 1
        )
    """,
    "traffic_events": """
        CREATE TABLE IF NOT EXISTS traffic_events (
            id VARCHAR(50) PRIMARY KEY,
            corridorName VARCHAR(255) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            congestionLevel VARCHAR(50) NOT NULL,
            averageSpeedKmH DOUBLE PRECISION NOT NULL,
            freeFlowSpeedKmH DOUBLE PRECISION NOT NULL,
            delayMinutes DOUBLE PRECISION NOT NULL,
            affectedVehiclesEstimate INT DEFAULT 0,
            observedByBusId VARCHAR(50) NOT NULL,
            timestamp VARCHAR(50) NOT NULL,
            densityScore DOUBLE PRECISION NOT NULL
        )
    """,
    "safety_incidents": """
        CREATE TABLE IF NOT EXISTS safety_incidents (
            id VARCHAR(50) PRIMARY KEY,
            incidentType VARCHAR(100) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            confidence DOUBLE PRECISION NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            timestamp VARCHAR(50) NOT NULL,
            busId VARCHAR(50) NOT NULL,
            routeId VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            trackedObject VARCHAR(100) NOT NULL,
            eventDescription TEXT NOT NULL,
            videoRefUrl TEXT,
            evidenceImageUrl TEXT,
            anprInfo TEXT,
            actionTaken TEXT
        )
    """,
    "distress_alerts": """
        CREATE TABLE IF NOT EXISTS distress_alerts (
            id VARCHAR(50) PRIMARY KEY,
            alertCode VARCHAR(50) NOT NULL,
            citizenName VARCHAR(100) NOT NULL,
            category VARCHAR(100) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            timestamp VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            mediaUrl TEXT,
            nearestBusId VARCHAR(50),
            nearestResponseUnit VARCHAR(100),
            notes TEXT
        )
    """,
    "anpr_detections": """
        CREATE TABLE IF NOT EXISTS anpr_detections (
            id VARCHAR(50) PRIMARY KEY,
            plateNumber VARCHAR(50) NOT NULL,
            rawPlateText VARCHAR(50),
            vehicleType VARCHAR(50) NOT NULL,
            confidence DOUBLE PRECISION NOT NULL,
            color VARCHAR(50) NOT NULL,
            speedEstimated DOUBLE PRECISION NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            timestamp VARCHAR(50) NOT NULL,
            busId VARCHAR(50) NOT NULL,
            flaggedReason TEXT,
            demoOcrCropUrl TEXT
        )
    """,
    "vehicle_watchlist": """
        CREATE TABLE IF NOT EXISTS vehicle_watchlist (
            id VARCHAR(50) PRIMARY KEY,
            vehicleId VARCHAR(50) NOT NULL,
            plateNumber VARCHAR(50) NOT NULL,
            reason TEXT NOT NULL,
            department VARCHAR(100) NOT NULL,
            active INT DEFAULT 1,
            validFrom VARCHAR(50) NOT NULL,
            validUntil VARCHAR(50) NOT NULL,
            notes TEXT,
            addedBy VARCHAR(100) NOT NULL
        )
    """,
    "watchlist_matches": """
        CREATE TABLE IF NOT EXISTS watchlist_matches (
            id VARCHAR(50) PRIMARY KEY,
            watchlistId VARCHAR(50) NOT NULL,
            plateNumber VARCHAR(50) NOT NULL,
            detectedByBusId VARCHAR(50) NOT NULL,
            timestamp VARCHAR(50) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            confidence DOUBLE PRECISION NOT NULL,
            evidenceImageUrl TEXT,
            status VARCHAR(50) NOT NULL,
            reviewedBy VARCHAR(100)
        )
    """,
    "survey_missions": """
        CREATE TABLE IF NOT EXISTS survey_missions (
            id VARCHAR(50) PRIMARY KEY,
            missionCode VARCHAR(50) NOT NULL,
            sector VARCHAR(100) NOT NULL,
            roadSegmentIds TEXT NOT NULL,
            priority VARCHAR(50) NOT NULL,
            reason TEXT NOT NULL,
            recommendedVehicleId VARCHAR(50) NOT NULL,
            assignedVehicleCode VARCHAR(50),
            status VARCHAR(50) NOT NULL,
            assignedAt VARCHAR(50) NOT NULL
        )
    """,
    "video_clips": """
        CREATE TABLE IF NOT EXISTS video_clips (
            id VARCHAR(50) PRIMARY KEY,
            busId VARCHAR(50) NOT NULL,
            cameraName VARCHAR(50) NOT NULL,
            startTime VARCHAR(50) NOT NULL,
            endTime VARCHAR(50) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            videoUrl TEXT NOT NULL,
            thumbnailUrl TEXT NOT NULL,
            relevanceScore DOUBLE PRECISION DEFAULT 0.0,
            matchedEvents TEXT
        )
    """,
    "maintenance_tickets": """
        CREATE TABLE IF NOT EXISTS maintenance_tickets (
            id VARCHAR(50) PRIMARY KEY,
            ticketCode VARCHAR(50) NOT NULL,
            defectId VARCHAR(50) NOT NULL,
            defectType VARCHAR(100) NOT NULL,
            priority VARCHAR(20) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            address VARCHAR(255) NOT NULL,
            reportedAt VARCHAR(50) NOT NULL,
            targetResolutionDate VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            assignedContractor VARCHAR(100) NOT NULL,
            assignedDepartment VARCHAR(100),
            confirmingBusesCount INT DEFAULT 1,
            estimatedCostInr DOUBLE PRECISION DEFAULT 0.0,
            evidenceImageUrl TEXT,
            resolutionNotes TEXT
        )
    """,
    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            fullName VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            department VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            avatarUrl TEXT,
            passwordHash VARCHAR(255)
        )
    """,
    "audit_logs": """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id VARCHAR(50) PRIMARY KEY,
            userId VARCHAR(50) NOT NULL,
            username VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            action VARCHAR(100) NOT NULL,
            resource VARCHAR(100) NOT NULL,
            details TEXT,
            timestamp VARCHAR(50) NOT NULL,
            ipAddress VARCHAR(50) NOT NULL
        )
    """,
    "system_health": """
        CREATE TABLE IF NOT EXISTS system_health (
            id INT PRIMARY KEY,
            activeBusesTotal INT NOT NULL,
            onlineBusesCount INT NOT NULL,
            cameraHealthPercent DOUBLE PRECISION NOT NULL,
            gpsHealthPercent DOUBLE PRECISION NOT NULL,
            avgEdgeInferenceFps DOUBLE PRECISION NOT NULL,
            queueDepth INT NOT NULL,
            apiLatencyMs DOUBLE PRECISION NOT NULL,
            ingestionRateEventsPerSec DOUBLE PRECISION NOT NULL,
            dbHealthStatus VARCHAR(100) NOT NULL,
            cloudSyncStatus VARCHAR(100) NOT NULL,
            simulatedAt VARCHAR(50) NOT NULL
        )
    """,
    "notifications": """
        CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(50) PRIMARY KEY,
            eventType VARCHAR(100) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            department VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            targetEmail VARCHAR(255),
            targetPhone VARCHAR(50),
            channel VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            timestamp VARCHAR(50) NOT NULL,
            metadataJson TEXT
        )
    """,
    "notification_rules": """
        CREATE TABLE IF NOT EXISTS notification_rules (
            id VARCHAR(50) PRIMARY KEY,
            eventType VARCHAR(100) NOT NULL,
            minSeverity VARCHAR(50) NOT NULL,
            department VARCHAR(100) NOT NULL,
            targetEmail VARCHAR(255),
            targetPhone VARCHAR(50),
            emailEnabled INT DEFAULT 1,
            smsEnabled INT DEFAULT 1,
            active INT DEFAULT 1
        )
    """
}

def create_all_tables(conn):
    cur = conn.cursor()
    for table_name, ddl in TABLE_DEFINITIONS.items():
        # Adapt DDL for SQLite if in SQLite mode
        if not getattr(conn, 'is_postgres', False):
            sqlite_ddl = ddl.replace("DOUBLE PRECISION", "REAL").replace("VARCHAR(255)", "TEXT").replace("VARCHAR(100)", "TEXT").replace("VARCHAR(50)", "TEXT").replace("VARCHAR(20)", "TEXT").replace("INT PRIMARY KEY", "INTEGER PRIMARY KEY")
            cur.execute(sqlite_ddl)
        else:
            cur.execute(ddl)
    conn.commit()
