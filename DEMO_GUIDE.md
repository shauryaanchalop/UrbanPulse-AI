# UrbanPulse AI — Smart India Hackathon 2026 Master Demo Guide

> **"Every Bus. A Mobile Sensor. One Intelligent City."**  
> **Problem Statement ID**: 26124 | **Category**: AI-Powered Mobile Urban Intelligence Platform

---

## 🚀 Quick Demo Access & Role Accounts

For instant hackathon presentation and judge evaluation, click **`LOGIN`** on the public header and select **`TRY DEMO`** to single-click log into any pre-configured role account:

| Role | Demo Email | Access Route | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@demo.urbanpulse.ai` | `/citizen` (`#citizen`) | Report road defects, track report status, earn civic rewards & points |
| **Municipal Operator** | `operator@demo.urbanpulse.ai` | `/operator` (`#operator`) | "What Needs Attention?", Live Road Health Map, P1-P4 Work Orders |
| **Fleet Operator** | `fleet@demo.urbanpulse.ai` | `/fleet` (`#fleet`) | Vehicle telemetry, 4-camera feeds, Edge AI status & telemetry |
| **Police Investigator** | `investigator@demo.urbanpulse.ai` | `/investigator` (`#investigator`) | Forensic incident search, nearby bus clip playback, ANPR plate match |
| **Super Admin** | `admin@demo.urbanpulse.ai` | `/admin` (`#admin`) | User management, notification rules, watchlist, AI model versions, audit logs |

> **Demo Password**: `password123` (automatically auto-filled upon clicking any role in 1-Click Demo Access).

---

## 🎬 7-Minute Guided Presentation Scenario

To demonstrate the full end-to-end capabilities during an SIH presentation:

### Scene 1: Public Architectural Showcase (`/` or `#landing`)
- Showcase the hero headline: **"EVERY BUS. A MOBILE SENSOR. ONE INTELLIGENT CITY."**
- Demonstrate the **Live GIS City Map** with 20+ moving bus sensors and real-time road segment color changes.
- Click navbar items (`PLATFORM`, `HOW IT WORKS`, `ROAD HEALTH`, `SAFETY`, `EVIDENCE`, `FOR CITIES`, `IMPACT`) to demonstrate smooth scrolling navigation.

### Scene 2: 1-Click Role Login (`/login` or `#login`)
- Click **`LOGIN`** in the top navbar.
- Open **`TRY DEMO`** and click **`Municipal Command Center`** to instantly log in as `operator@demo.urbanpulse.ai`.

### Scene 3: Operator Command Center (`/operator` or `#operator`)
- View **"WHAT NEEDS ATTENTION?"** priority dashboard.
- Inspect the **Live Road Health Map** showing GREEN (Healthy), YELLOW (Degrading), ORANGE (Needs Attention), RED (Critical), and GRAY (Unknown).
- Click on any road segment or defect marker to open the **Inspector Drawer** with confidence scores and camera bounding boxes.

### Scene 4: Live Road Health & Lifecycle Simulator (`#road-health`)
- Navigate to the **Road Health Lifecycle** section on the landing page or simulator controls.
- Step 1 (**OBSERVE**): Bus UP-042 scans University Road corridor (PCI 92, GREEN).
- Step 2 (**DETECT**): Pothole detected (GREEN → RED).
- Step 3 (**VERIFY**): 2nd bus UP-117 corroborates defect (VERIFIED RED, Work Order #WO-1028 generated).
- Step 4 (**REPAIR**): Municipal asphalt crew completes repair.
- Step 5 (**RE-VERIFY**): Bus UP-031 passes post-repair (State returns to GREEN).

### Scene 5: Citizen Reporting & Rewards (`/citizen` or `#citizen`)
- Switch to Citizen Portal.
- Select **`Report Road Issue`**, take/upload a photo, and view AI classification (`Pothole Defect - 94% confidence`).
- Submit report to receive **+25 Civic Points** on the leaderboard.

### Scene 6: Vision AI & Fog/Winter Dehazing Sandbox (`/vision` or `#vision`)
- Open the Vision AI Sandbox.
- Click **`ENABLE WEBCAM`** for live browser camera object detection, or pick a sample from the **Sample Media Library**.
- Toggle **Fog / Winter Visibility Mode**: `CLEAR` → `LIGHT FOG` → `DENSE FOG`.
- Observe the dehazing visualization, visibility score (`28% DENSE FOG`), and confidence adjustment.
- Inspect the **ANPR License Plate OCR** with the warning banner:  
  `POTENTIAL VEHICLE-OF-INTEREST MATCH - Human verification required`.

### Scene 7: Forensic Evidence Search (`/investigator` or `#investigator`)
- Enter incident parameters: `Time: 14:32 | Sector: Sector 18 (Kothrud)`.
- Click **`SEARCH EVIDENCE`**. The engine spatio-temporally ranks nearby buses (Bus UP-042 at 46m, Bus UP-117 at 83m).
- Click **`PLAY FORENSIC CLIP`** to preview camera footage.

### Scene 8: Fullscreen Kiosk Mode (`/kiosk` or Key `K`)
- Press key **`K`** or click **`KIOSK`** in the header to enter fullscreen 1920x1080 command center mode.
- Press **`ESC`** or key **`K`** to exit back to the operational dashboard.

---

## ⌨️ Global Keyboard Shortcuts

- **`Ctrl + K`** or **`/`**: Open Global Command Palette Search (Buses, Defects, Incidents, Reports, Work Orders).
- **`K`** or **`k`**: Toggle Fullscreen Command Center Kiosk Mode.
- **`ESC`**: Exit Kiosk Mode or close Inspector Drawer.
