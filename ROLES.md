# UrbanPulse AI — Role-Based Access Control (RBAC) & Console Portals

> **Tailored Operational Interfaces for Every Stakeholder**

---

## 👥 Role Matrix & Console Views

| Role | Access Route | Target Console Headline | Core Functionality |
| :--- | :--- | :--- | :--- |
| **Citizen** | `/citizen` | *"Your Reports / Your Impact"* | Mobile issue reporting, photo upload, civic points leaderboard, contribution tracking |
| **Municipal Operator** | `/operator` | *"What Needs Attention?"* | City road health map, priority queue, unverified defects stream, P1-P4 work order dispatch |
| **Fleet Operator** | `/fleet` | *"How Is My Vehicle Performing?"* | Bus telemetry, 4-camera video array, edge AI FPS & hardware status, vehicle routes |
| **Police Investigator** | `/investigator` | *"Find the Evidence"* | Forensic incident search, nearby bus video clip playback, ANPR plate match review |
| **Super Admin** | `/admin` | *"Is The System Healthy?"* | User management, RBAC, camera config, watchlist management, notification rules, audit logs |

---

## 🔒 Authentication & 1-Click Demo Accounts

The portal authentication system (`LoginView.tsx`) requires users to log in before accessing protected routes. For SIH presentation mode, the **`TRY DEMO`** drawer provides 1-click single button login for all accounts:

- **Citizen**: `citizen@demo.urbanpulse.ai`
- **Municipal Operator**: `operator@demo.urbanpulse.ai`
- **Fleet Operator**: `fleet@demo.urbanpulse.ai`
- **Police Investigator**: `investigator@demo.urbanpulse.ai`
- **Super Admin**: `admin@demo.urbanpulse.ai`

> Demo Password for all accounts: `password123` (auto-filled on click).
