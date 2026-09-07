export type UserRole = 
  | 'Command Center Operator'
  | 'Municipal Road Engineer'
  | 'Traffic Control Officer'
  | 'Fleet Administrator';

export interface CameraFeed {
  id: string;
  name: string;
  status: string;
  resolution: string;
  fps: number;
}

export interface Bus {
  id: string;
  fleetNumber: string;
  routeId: string;
  routeName: string;
  status: 'Active' | 'Idle' | 'Warning' | 'Maintenance' | 'Offline';
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  cameraHealth: string;
  gpsHealth: string;
  networkStatus: string;
  edgeFps: number;
  gpuUtilization: number;
  lastEvent?: string;
  lastUpdateTime: string;
  currentPassengerLoad?: number;
  cameras: CameraFeed[];
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface Route {
  id: string;
  name: string;
  corridor: string;
  totalDistanceKm: number;
  activeBusesCount: number;
  avgSpeedKmH: number;
  congestionLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  waypoints: RouteWaypoint[];
}

export interface RoadDefect {
  id: string;
  defectType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  latitude: number;
  longitude: number;
  address: string;
  routeId: string;
  detectedByBusId: string;
  firstSeen: string;
  lastSeen: string;
  timesConfirmed: number;
  status: 'Reported' | 'Cross-verified' | 'Ticket Created' | 'Under Repair' | 'Resolved';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  evidenceImageUrl?: string;
  dimensionsEstimated?: string;
  crossVerifyingBuses: string[];
}

export interface TrafficEvent {
  id: string;
  corridorName: string;
  latitude: number;
  longitude: number;
  congestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Standstill';
  averageSpeedKmH: number;
  freeFlowSpeedKmH: number;
  delayMinutes: number;
  affectedVehiclesEstimate: number;
  observedByBusId: string;
  timestamp: string;
  densityScore: number;
}

export interface ANPRDetection {
  id: string;
  plateNumber: string;
  vehicleType: string;
  confidence: number;
  color: string;
  speedEstimated: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  busId: string;
  flaggedReason?: string;
  demoOcrCropUrl?: string;
}

export interface SafetyIncident {
  id: string;
  incidentType: string;
  severity: 'Critical' | 'High' | 'Medium';
  confidence: number;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  busId: string;
  routeId: string;
  status: 'Detected' | 'Verified' | 'Escalated to Police' | 'Resolved' | 'Dismissed';
  trackedObject: string;
  eventDescription: string;
  videoRefUrl?: string;
  evidenceImageUrl?: string;
  anprInfo?: ANPRDetection;
  actionTaken?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketCode: string;
  defectId: string;
  defectType: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  severity: string;
  latitude: number;
  longitude: number;
  address: string;
  reportedAt: string;
  targetResolutionDate: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Verified';
  assignedContractor: string;
  confirmingBusesCount: number;
  estimatedCostInr: number;
  evidenceImageUrl?: string;
  resolutionNotes?: string;
}

export interface SystemHealth {
  activeBusesTotal: number;
  onlineBusesCount: number;
  cameraHealthPercent: number;
  gpsHealthPercent: number;
  avgEdgeInferenceFps: number;
  queueDepth: number;
  apiLatencyMs: number;
  ingestionRateEventsPerSec: number;
  dbHealthStatus: string;
  cloudSyncStatus: string;
  simulatedAt: string;
}

export interface SimulationStatus {
  isRunning: boolean;
  speed: number;
  elapsedSeconds: number;
  isDemoMode: boolean;
  demoStepIndex: number;
  demoStepDescription: string;
  activeBuses: number;
  totalEventsGenerated: number;
}

export interface OverviewKPIs {
  activeBuses: number;
  totalRoadIssues: number;
  criticalIncidents: number;
  congestionHotspots: number;
  openMaintenanceTickets: number;
  roadCoveragePercent: number;
  multiBusVerifiedCount: number;
  safetyAlertsToday: number;
}
