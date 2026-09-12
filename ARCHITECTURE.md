# URBANPULSE AI — SYSTEM ARCHITECTURE SPECIFICATION

**Smart India Hackathon 2026 — Problem Statement ID: 26124**

```
                     +---------------------------------------+
                     |      MULTI-LAYER SENSING NETWORK      |
                     +---------------------------------------+
                                         |
     +-------------------+---------------+---------------+-------------------+
     |                   |                               |                   |
[Layer 1: Bus Fleet] [Layer 2: Service Vehicles] [Layer 3: Citizen Reports] [Layer 4: Survey Missions]
 (32 Public Buses)    (10 Municipal Vehicles)       (Mobile /report)        (Sector Coverage Gaps)
     |                   |                               |                   |
     +-------------------+---------------+---------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |        EDGE AI VISION ENGINE          |
                     | (YOLOv9 + LPRNet ANPR + Trackers)     |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |  MULTI-SOURCE EVIDENCE FUSION ENGINE  |
                     | (Spatial Clustering + Haversine Match)|
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |      ROAD HEALTH GRID STATE MACHINE   |
                     |   (GREEN / YELLOW / RED / GRAY States)|
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |  FASTAPI BACKEND & WEBSOCKET ENGINE   |
                     +---------------------------------------+
                                         |
     +-------------------+---------------+---------------+-------------------+
     |                   |                               |                   |
[Portal 1: Citizen] [Portal 2: Command]         [Portal 3: Fleet]   [Portal 4: Admin]
 (/report)           (/command)                  (/fleet)            (/admin)
```

---

## Data Schema & Entities

1. **`users` & `sessions`**: User accounts, JWT tokens, RBAC roles.
2. **`buses` & `service_vehicles`**: Fleet telemetry, GPS coordinates, speed, camera health.
3. **`road_segments` & `road_defects`**: Health scores, coverage state, defect verifications.
4. **`citizen_reports` & `reward_accounts`**: Public submissions, AI predictions, civic leaderboard points.
5. **`incidents` & `video_clips`**: Safety alerts, spatial-temporal clip ranking.
6. **`plate_detections` & `vehicle_watchlist`**: Local OCR detections and authorized watchlist matches.
7. **`notifications` & `notification_rules`**: SendGrid email and Twilio SMS log deliveries.
