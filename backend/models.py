from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class GeoPoint(BaseModel):
    lat: float
    lng: float

class CameraFeed(BaseModel):
    id: str
    name: str  # front, rear, left, right
    status: str  # active, degraded, offline
    resolution: str = "1920x1080"
    fps: float = 30.0

class Bus(BaseModel):
    id: str
    fleetNumber: str
    routeId: str
    routeName: str
    status: str  # Active, Idle, Warning, Maintenance, Offline
    latitude: float
    longitude: float
    speed: float  # km/h
    heading: float  # degrees 0-360
    cameraHealth: str  # Optimal, Minor Glitch, Degraded, Critical
    gpsHealth: str  # High Accuracy (RTK), Standard GPS, Degraded
    networkStatus: str  # 5G Connected, 4G Fallback, Weak, Disconnected
    edgeFps: float
    gpuUtilization: int  # percentage
    lastEvent: Optional[str] = None
    lastUpdateTime: str
    currentPassengerLoad: Optional[int] = None
    cameras: List[CameraFeed] = []
    vehicleType: str = "Public Transit Bus"

class ServiceVehicle(BaseModel):
    id: str
    vehicleCode: str
    department: str
    vehicleType: str  # Sanitation, Inspection, Utility, Maintenance
    latitude: float
    longitude: float
    speed: float
    status: str
    currentMissionId: Optional[str] = None
    lastActive: str

class RouteWaypoint(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None

class Route(BaseModel):
    id: str
    name: str
    corridor: str
    totalDistanceKm: float
    activeBusesCount: int
    avgSpeedKmH: float
    congestionLevel: str  # Low, Moderate, High, Severe
    waypoints: List[RouteWaypoint]

class RoadSegment(BaseModel):
    id: str
    segmentId: str
    name: str
    sector: str
    healthScore: int  # 0 to 100
    condition: str  # Healthy, Degrading, Attention, Critical, Unknown
    lastObservedAt: str
    observationCount: int
    defectCount: int
    criticality: str  # Low, Medium, High, Critical
    coverageState: str  # RECENTLY_OBSERVED, AGING_OBSERVATION, INSUFFICIENT_COVERAGE, UNOBSERVED
    openWorkOrders: int
    coordinates: List[Dict[str, float]]
    assignedVehicleType: str  # Bus, Municipal Vehicle, Survey Mission

class RoadDefect(BaseModel):
    id: str
    defectType: str  # Pothole, Waterlogging, Damaged Sign, Missing Road Marking, Broken Divider, Surface Cracking
    severity: str  # Critical, High, Medium, Low
    confidence: float  # 0.0 - 1.0
    latitude: float
    longitude: float
    address: str
    routeId: str
    detectedByBusId: str
    firstSeen: str
    lastSeen: str
    timesConfirmed: int = 1
    status: str  # Reported, Cross-verified, Ticket Created, Under Repair, Pending Verification, Repair Verified, Resolved
    priority: str  # P1, P2, P3, P4
    evidenceImageUrl: Optional[str] = None
    dimensionsEstimated: Optional[str] = None
    crossVerifyingBuses: List[str] = []
    segmentId: Optional[str] = None

class CitizenReport(BaseModel):
    id: str
    referenceNo: str
    reporterName: str
    category: str  # Road Problem, Accident / Incident, Safety / Distress, Traffic Issue, Other
    latitude: float
    longitude: float
    address: str
    description: Optional[str] = None
    photoUrl: Optional[str] = None
    status: str  # RECEIVED, VERIFIED, ASSIGNED, REPAIR_IN_PROGRESS, RESOLVED, VERIFIED_REPAIR
    aiClassification: Optional[str] = None
    aiConfidence: float = 0.0
    aiSeverity: str = "Low"
    pointsAwarded: int = 0
    submittedAt: str
    verificationSourcesCount: int = 1

class RewardAccount(BaseModel):
    userId: str
    userName: str
    displayName: str
    points: int
    level: str  # Bronze, Silver, Gold, Platinum, Sentinel
    badges: List[str]
    reportCount: int
    verifiedReportCount: int
    impactScore: int
    rank: int

class RewardRule(BaseModel):
    id: str
    event: str
    points: int
    description: str
    enabled: bool = True

class TrafficEvent(BaseModel):
    id: str
    corridorName: str
    latitude: float
    longitude: float
    congestionLevel: str  # Low, Moderate, Heavy, Standstill
    averageSpeedKmH: float
    freeFlowSpeedKmH: float = 45.0
    delayMinutes: float
    affectedVehiclesEstimate: int
    observedByBusId: str
    timestamp: str
    densityScore: float  # 0.0 - 1.0

class ANPRDetection(BaseModel):
    id: str
    plateNumber: str
    rawPlateText: str
    vehicleType: str  # Car, Motorcycle, Auto-Rickshaw, Truck, Commercial Van
    confidence: float
    color: str
    speedEstimated: float
    latitude: float
    longitude: float
    timestamp: str
    busId: str
    flaggedReason: Optional[str] = None
    demoOcrCropUrl: Optional[str] = None

class WatchlistItem(BaseModel):
    id: str
    vehicleId: str
    plateNumber: str
    reason: str
    department: str
    active: bool
    validFrom: str
    validUntil: str
    notes: Optional[str] = None
    addedBy: str

class WatchlistMatch(BaseModel):
    id: str
    watchlistId: str
    plateNumber: str
    detectedByBusId: str
    timestamp: str
    latitude: float
    longitude: float
    address: str
    confidence: float
    evidenceImageUrl: Optional[str] = None
    status: str  # POTENTIAL_MATCH, HUMAN_VERIFIED, DISMISSED, ESCALATED
    reviewedBy: Optional[str] = None

class SafetyIncident(BaseModel):
    id: str
    incidentType: str  # Rash Driving, Dangerous Pedestrian Proximity, Near Collision, Hit & Run Alert, Sudden Lane Swerve
    severity: str  # Critical, High, Medium
    confidence: float
    latitude: float
    longitude: float
    address: str
    timestamp: str
    busId: str
    routeId: str
    status: str  # Detected, Verified, Escalated to Police, Resolved, Dismissed
    trackedObject: str
    eventDescription: str
    videoRefUrl: Optional[str] = None
    evidenceImageUrl: Optional[str] = None
    anprInfo: Optional[ANPRDetection] = None
    actionTaken: Optional[str] = None

class DistressAlert(BaseModel):
    id: str
    alertCode: str
    citizenName: str
    category: str  # PERSONAL SAFETY, HARASSMENT, MEDICAL, ROAD INCIDENT, OTHER
    latitude: float
    longitude: float
    address: str
    timestamp: str
    status: str  # ACTIVE, ACKNOWLEDGED, DISPATCHED, RESOLVED
    mediaUrl: Optional[str] = None
    nearestBusId: Optional[str] = None
    nearestResponseUnit: Optional[str] = None
    notes: Optional[str] = None

class SurveyMission(BaseModel):
    id: str
    missionCode: str
    sector: str
    roadSegmentIds: List[str]
    priority: str  # HIGH, MEDIUM, LOW
    reason: str  # Insufficient observation, citizen reports, historical defect, school zone
    recommendedVehicleId: str
    assignedVehicleCode: Optional[str] = None
    status: str  # PENDING, ASSIGNED, IN_PROGRESS, COMPLETED
    assignedAt: str

class VideoClip(BaseModel):
    id: str
    busId: str
    cameraName: str
    startTime: str
    endTime: str
    latitude: float
    longitude: float
    address: str
    videoUrl: str
    thumbnailUrl: str
    relevanceScore: float = 0.0
    matchedEvents: List[str] = []

class EvidenceCase(BaseModel):
    id: str
    caseNumber: str
    title: str
    incidentType: str
    location: str
    dateTime: str
    radiusMeters: int
    status: str  # OPEN, UNDER_REVIEW, CLOSED
    matchedClips: List[VideoClip] = []

class MaintenanceTicket(BaseModel):
    id: str
    ticketCode: str
    defectId: str
    defectType: str
    priority: str  # P1, P2, P3, P4
    severity: str
    latitude: float
    longitude: float
    address: str
    reportedAt: str
    targetResolutionDate: str
    status: str  # DETECTED, VERIFIED, ASSIGNED, IN_PROGRESS, COMPLETED, PENDING_VERIFICATION, RE_VERIFIED, CLOSED
    assignedContractor: str
    assignedDepartment: str = "Road Maintenance Dept"
    confirmingBusesCount: int
    estimatedCostInr: int
    evidenceImageUrl: Optional[str] = None
    resolutionNotes: Optional[str] = None

class User(BaseModel):
    id: str
    username: str
    fullName: str
    role: str  # SUPER ADMIN, ICCC OPERATOR, ROAD ENGINEER, POLICE / AUTHORIZED INVESTIGATOR, FLEET OPERATOR, CITIZEN
    department: str
    email: str
    avatarUrl: Optional[str] = None

class AuditLog(BaseModel):
    id: str
    userId: str
    username: str
    role: str
    action: str
    resource: str
    details: str
    timestamp: str
    ipAddress: str = "127.0.0.1"

class SystemHealth(BaseModel):
    activeBusesTotal: int
    onlineBusesCount: int
    cameraHealthPercent: float
    gpsHealthPercent: float
    avgEdgeInferenceFps: float
    queueDepth: int
    apiLatencyMs: float
    ingestionRateEventsPerSec: float
    dbHealthStatus: str
    cloudSyncStatus: str
    simulatedAt: str

class SimulationStatus(BaseModel):
    isRunning: bool
    speed: int  # 1, 2, 5, 10
    elapsedSeconds: int
    isDemoMode: bool
    demoStepIndex: int
    demoStepDescription: str
    activeBuses: int
    totalEventsGenerated: int

class OverviewKPIs(BaseModel):
    activeBuses: int
    totalRoadIssues: int
    criticalIncidents: int
    congestionHotspots: int
    openMaintenanceTickets: int
    roadCoveragePercent: float
    multiBusVerifiedCount: int
    safetyAlertsToday: int
    unverifiedReportsCount: int = 7
    offlineBusesCount: int = 2

