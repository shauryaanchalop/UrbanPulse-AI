from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class GeoPoint(BaseModel):
    lat: float
    lng: float

class CameraFeed(BaseModel):
    id: str
    name: str # front, rear, left, right
    status: str # active, degraded, offline
    resolution: str = "1920x1080"
    fps: float = 30.0

class Bus(BaseModel):
    id: str
    fleetNumber: str
    routeId: str
    routeName: str
    status: str # Active, Idle, Warning, Maintenance, Offline
    latitude: float
    longitude: float
    speed: float # km/h
    heading: float # degrees 0-360
    cameraHealth: str # Optimal, Minor Glitch, Degraded, Critical
    gpsHealth: str # High Accuracy (RTK), Standard GPS, Degraded
    networkStatus: str # 5G Connected, 4G Fallback, Weak, Disconnected
    edgeFps: float
    gpuUtilization: int # percentage
    lastEvent: Optional[str] = None
    lastUpdateTime: str
    currentPassengerLoad: Optional[int] = None
    cameras: List[CameraFeed] = []

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
    congestionLevel: str # Low, Moderate, High, Severe
    waypoints: List[RouteWaypoint]

class RoadDefect(BaseModel):
    id: str
    defectType: str # Pothole, Waterlogging, Damaged Sign, Missing Road Marking, Broken Divider, Surface Cracking
    severity: str # Critical, High, Medium, Low
    confidence: float # 0.0 - 1.0
    latitude: float
    longitude: float
    address: str
    routeId: str
    detectedByBusId: str
    firstSeen: str
    lastSeen: str
    timesConfirmed: int = 1
    status: str # Reported, Cross-verified, Ticket Created, Under Repair, Resolved
    priority: str # P1, P2, P3, P4
    evidenceImageUrl: Optional[str] = None
    dimensionsEstimated: Optional[str] = None # e.g. "45cm x 30cm, 8cm depth"
    crossVerifyingBuses: List[str] = []

class TrafficEvent(BaseModel):
    id: str
    corridorName: str
    latitude: float
    longitude: float
    congestionLevel: str # Low, Moderate, Heavy, Standstill
    averageSpeedKmH: float
    freeFlowSpeedKmH: float = 45.0
    delayMinutes: float
    affectedVehiclesEstimate: int
    observedByBusId: str
    timestamp: str
    densityScore: float # 0.0 - 1.0

class ANPRDetection(BaseModel):
    id: str
    plateNumber: str
    vehicleType: str # Car, Motorcycle, Auto-Rickshaw, Truck, Commercial Van
    confidence: float
    color: str
    speedEstimated: float
    latitude: float
    longitude: float
    timestamp: str
    busId: str
    flaggedReason: Optional[str] = None # e.g. "Lane Violation", "Suspected Hit & Run", "Speeding"
    demoOcrCropUrl: Optional[str] = None

class SafetyIncident(BaseModel):
    id: str
    incidentType: str # Rash Driving, Dangerous Pedestrian Proximity, Near Collision, Hit & Run Alert, Sudden Lane Swerve
    severity: str # Critical, High, Medium
    confidence: float
    latitude: float
    longitude: float
    address: str
    timestamp: str
    busId: str
    routeId: str
    status: str # Detected, Verified, Escalated to Police, Resolved, Dismissed
    trackedObject: str # e.g. "Black SUV (DL-3C-AB8921)"
    eventDescription: str
    videoRefUrl: Optional[str] = None
    evidenceImageUrl: Optional[str] = None
    anprInfo: Optional[ANPRDetection] = None
    actionTaken: Optional[str] = None

class MaintenanceTicket(BaseModel):
    id: str
    ticketCode: str # e.g. "TKT-2026-0842"
    defectId: str
    defectType: str
    priority: str # P1, P2, P3, P4
    severity: str
    latitude: float
    longitude: float
    address: str
    reportedAt: str
    targetResolutionDate: str
    status: str # Open, Assigned, In Progress, Resolved, Verified
    assignedContractor: str
    confirmingBusesCount: int
    estimatedCostInr: int
    evidenceImageUrl: Optional[str] = None
    resolutionNotes: Optional[str] = None

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
    speed: int # 1, 2, 5, 10
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
