# UrbanPulse AI — 5-Minute SIH Demo Script

This document is a step-by-step presentation script for the Smart India Hackathon 2026 jury.

---

## 🎬 5-Minute Scripted Pitch: "City Morning Peak Simulation"

### Minute 0:00 – The Hook & Product Vision
- **Action**: Open dashboard at `http://localhost:5173`. Point to the top KPI cards and live interactive GIS map.
- **Presenter Speech**:
  > *"Respected jury members, Indian smart cities spend millions installing and maintaining fixed CCTV cameras, yet over 70% of road defects, hit-and-run incidents, and localized bottlenecks go undetected until citizens file complaints. We asked: What if every public transport bus already on the road became a mobile AI sensor? Welcome to UrbanPulse AI: Every Bus. A Mobile Sensor. One Intelligent City."*

### Minute 0:40 – Start Demo & Fleet Sensing
- **Action**: Click the **`[ START DEMO ]`** button in the header. Notice the floating stepper overlay appear and buses begin moving along route waypoints.
- **Presenter Speech**:
  > *"Here, 32 municipal transit buses are moving along 10 arterial corridors. Rather than streaming heavy video over 5G, onboard edge AI processes feeds locally at 30 FPS and transmits only structured metadata. Notice Bus-004 just registered a high-severity pothole on the Wakad Flyover ramp with 94% confidence."*

### Minute 1:20 – The Game Changer: Multi-Bus Cross-Verification
- **Action**: Watch step 5 fire. Point out the badge **"Cross-verified (2 Buses)"** on the pothole marker.
- **Presenter Speech**:
  > *"Single cameras can suffer from lighting glare or false positives. Watch what happens when Bus-012 passes 20 minutes later: UrbanPulse AI's spatial correlation engine cross-verifies the defect, boosting confidence to 98%. The system has now eliminated human inspection delays."*

### Minute 1:40 – Automated Maintenance Dispatch
- **Action**: Switch to the **Maintenance Tickets** tab. Highlight Ticket `TKT-2026-0842` marked **P1**.
- **Presenter Speech**:
  > *"Without manual intervention, an SLA-backed P1 work order was dispatched directly to the municipal asphalt repair contractor with target resolution under 24 hours."*

### Minute 2:20 – Traffic Intelligence & OD Delay Calculator
- **Action**: Click **Traffic Intelligence** tab. Show the Origin-Destination calculator (Hinjawadi -> Shivajinagar).
- **Presenter Speech**:
  > *"Because 32 buses are continuously counting vehicles, we have live corridor travel times. Notice the Hinjawadi to Shivajinagar corridor is experiencing a 15-minute delay caused specifically by the pothole cluster we just detected."*

### Minute 3:20 – Safety Incident & Demo ANPR OCR
- **Action**: Switch to **Safety & ANPR** tab. Click on the rash-driving incident.
- **Presenter Speech**:
  > *"Our safety heuristics detect vehicles swerving into dedicated BRTS bus lanes. Here, a private sedan was tracked at 68 km/h in a 30 km/h transit lane, and our edge OCR extracted license plate MH-12-KQ-7722 with 96% confidence, generating an instant evidence pack for Traffic Police dispatch."*

### Minute 4:30 – 4-Camera Bus Inspector & Privacy Architecture
- **Action**: Switch to **Bus Fleet**, click on `BUS-004`, switch between Front, Rear, Left, and Right camera angles.
- **Presenter Speech**:
  > *"Operators can inspect any bus in the fleet with full telemetry. And crucially for DPDP Act 2023 compliance, raw video never leaves the bus unless an incident is flagged—faces are blurred, and data transmission is cut by 99.4%."*

### Minute 5:00 – Conclusion
- **Presenter Speech**:
  > *"UrbanPulse AI transforms existing public transport into an intelligent mobile nervous system for the entire city. **Observe → Detect → Verify → Prioritize → Act.** Thank you."*
