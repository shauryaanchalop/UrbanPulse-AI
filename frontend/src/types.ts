export type UserRole =
  | 'SUPER ADMIN'
  | 'ICCC OPERATOR'
  | 'ROAD ENGINEER'
  | 'POLICE / AUTHORIZED INVESTIGATOR'
  | 'FLEET OPERATOR'
  | 'CITIZEN'
  | 'Command Center Operator'
  | 'Municipal Road Engineer'
  | 'Traffic Control Officer'
  | 'Fleet Administrator';

export interface RewardRule {
  id: string;
  action: string;
  points: number;
  description: string;
  active: boolean;
}

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
  vehicleType?: string;
}

export interface ServiceVehicle {
  id: string;
  vehicleCode: string;
  department: string;
  vehicleType: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: string;
  currentMissionId?: string;
  lastActive: string;
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

export interface RoadSegment {
  id: string;
  segmentId: string;
  name: string;
  sector: string;
  healthScore: number;
  condition: 'Healthy' | 'Degrading' | 'Attention' | 'Critical' | 'Unknown';
  lastObservedAt: string;
  observationCount: number;
  defectCount: number;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  coverageState: 'RECENTLY_OBSERVED' | 'AGING_OBSERVATION' | 'INSUFFICIENT_COVERAGE' | 'UNOBSERVED';
  openWorkOrders: number;
  coordinates: { lat: number; lng: number }[];
  assignedVehicleType: string;
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
  status: 'Reported' | 'Cross-verified' | 'Ticket Created' | 'Under Repair' | 'Pending Verification' | 'Repair Verified' | 'Resolved';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  evidenceImageUrl?: string;
  dimensionsEstimated?: string;
  crossVerifyingBuses: string[];
  segmentId?: string;
}

export interface CitizenReport {
  id: string;
  referenceNo: string;
  reporterName: string;
  category: 'Road Problem' | 'Accident / Incident' | 'Safety / Distress' | 'Traffic Issue' | 'Other';
  latitude: number;
  longitude: number;
  address: string;
  description?: string;
  photoUrl?: string;
  status: 'RECEIVED' | 'VERIFIED' | 'ASSIGNED' | 'REPAIR_IN_PROGRESS' | 'RESOLVED' | 'VERIFIED_REPAIR';
  aiClassification?: string;
  aiConfidence: number;
  aiSeverity: string;
  pointsAwarded: number;
  submittedAt: string;
  verificationSourcesCount: number;
}

export interface RewardAccount {
  userId: string;
  userName: string;
  displayName: string;
  points: number;
  level: string;
  badges: string[];
  reportCount: number;
  verifiedReportCount: number;
  impactScore: number;
  rank: number;
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
  rawPlateText?: string;
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

export interface WatchlistItem {
  id: string;
  vehicleId: string;
  plateNumber: string;
  reason: string;
  department: string;
  active: boolean;
  validFrom: string;
  validUntil: string;
  notes?: string;
  addedBy: string;
  riskLevel?: string;
  category?: string;
  addedDate?: string;
}

export interface WatchlistMatch {
  id: string;
  watchlistId: string;
  plateNumber: string;
  detectedByBusId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address: string;
  confidence: number;
  evidenceImageUrl?: string;
  status: 'POTENTIAL_MATCH' | 'HUMAN_VERIFIED' | 'DISMISSED' | 'ESCALATED';
  reviewedBy?: string;
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

export interface DistressAlert {
  id: string;
  alertCode: string;
  citizenName: string;
  category: 'PERSONAL SAFETY' | 'HARASSMENT' | 'MEDICAL' | 'ROAD INCIDENT' | 'OTHER';
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  status: 'RECEIVED' | 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESPONDING' | 'RESOLVED';
  mediaUrl?: string;
  nearestBusId?: string;
  nearestResponseUnit?: string;
  notes?: string;
}

export interface SurveyMission {
  id: string;
  missionCode: string;
  sector: string;
  roadSegmentIds: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  recommendedVehicleId: string;
  assignedVehicleCode?: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedAt: string;
}

export interface VideoClip {
  id: string;
  busId: string;
  cameraName: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  address: string;
  videoUrl: string;
  thumbnailUrl: string;
  relevanceScore: number;
  matchedEvents: string[];
  distanceMeters?: number;
  timeDeltaSeconds?: number;
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
  status: 'DETECTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_VERIFICATION' | 'RE_VERIFIED' | 'CLOSED' | 'Open' | 'Resolved';
  assignedContractor: string;
  assignedDepartment?: string;
  confirmingBusesCount: number;
  estimatedCostInr: number;
  evidenceImageUrl?: string;
  resolutionNotes?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  department: string;
  email: string;
  avatarUrl?: string;
  status?: string;
  createdDate?: string;
  token?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  operatorName?: string;
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
  unverifiedReportsCount?: number;
  offlineBusesCount?: number;
}

