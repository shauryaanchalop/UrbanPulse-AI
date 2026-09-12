# URBANPULSE AI — SECURITY & COMPLIANCE SPECIFICATION

**Smart India Hackathon 2026 — Problem Statement ID: 26124**

---

## 1. Authentication & Role-Based Access Control (RBAC)

UrbanPulse AI implements strict multi-role authorizations to enforce privacy and data security across all 5 portal surfaces:

| Role Name | Scope | Permissions & Restrictions |
|---|---|---|
| **CITIZEN** | Public Mobile Portal (`/report`) | Can submit reports, view own report history, view civic point balance. **Restricted** from viewing raw bus camera streams or ANPR watchlist matches. |
| **ICCC OPERATOR** | Command Center (`/command`) | Full situational awareness map, work order creation, survey mission assignment. |
| **FLEET OPERATOR** | Fleet Portal (`/fleet`) | Vehicle telemetry, 4-cam stream status. **Restricted** from viewing restricted police evidence clips. |
| **POLICE / INVESTIGATOR** | Evidence Portal (`/evidence`) | Access to spatial-temporal video clip search, accident route matching, and ANPR watchlist verification. |
| **SUPER ADMIN** | System Admin (`/admin`) | RBAC user management, notification delivery rules, system audit log inspection. |

---

## 2. Privacy Controls & Data Anonymization (DPDP Act 2023)

1. **Facial & License Plate Blur Interface**: Camera feeds pass through an edge-side Gaussian blur layer before storage, ensuring compliance with India's Digital Personal Data Protection (DPDP) Act 2023.
2. **Human Verification Threshold**: Potential ANPR Watchlist matches require human operator verification before escalation (`POTENTIAL MATCH — HUMAN VERIFICATION REQUIRED`).
3. **Cryptographic Audit Logs**: All video evidence clip retrievals and watchlist queries are recorded with user ID, timestamp, and IP address in `audit_logs`.
