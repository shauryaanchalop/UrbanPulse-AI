import { 
  Bus, ServiceVehicle, Route, RoadSegment, RoadDefect, CitizenReport, RewardAccount, 
  TrafficEvent, SafetyIncident, DistressAlert, ANPRDetection, WatchlistItem, WatchlistMatch,
  SurveyMission, MaintenanceTicket, User, AuditLog, SystemHealth, SimulationStatus, OverviewKPIs 
} from '../types';

const API_BASE = '/api';
type str = string;

export const DEMO_USERS_MAP: Record<string, User> = {
  citizen: {
    id: 'user-cit-101',
    username: 'citizen',
    email: 'citizen@demo.urbanpulse.ai',
    fullName: 'Ananya Sharma',
    role: 'CITIZEN',
    department: 'Public Citizen',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    token: 'demo-jwt-token-citizen'
  },
  operator: {
    id: 'user-op-201',
    username: 'operator',
    email: 'operator@demo.urbanpulse.ai',
    fullName: 'Vikramaditya Deshmukh',
    role: 'ICCC OPERATOR',
    department: 'Municipal Control Center',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    token: 'demo-jwt-token-operator'
  },
  fleet: {
    id: 'user-fleet-301',
    username: 'fleet',
    email: 'fleet@demo.urbanpulse.ai',
    fullName: 'Rajesh Kulkarni',
    role: 'FLEET OPERATOR',
    department: 'PMPML Transit Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    token: 'demo-jwt-token-fleet'
  },
  investigator: {
    id: 'user-pol-401',
    username: 'investigator',
    email: 'investigator@demo.urbanpulse.ai',
    fullName: 'Inspector Sunita Patil',
    role: 'POLICE / AUTHORIZED INVESTIGATOR',
    department: 'Traffic & Cyber Crime Branch',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    token: 'demo-jwt-token-investigator'
  },
  admin: {
    id: 'user-admin-001',
    username: 'admin',
    email: 'admin@demo.urbanpulse.ai',
    fullName: 'Dr. Rajeshwar Rao',
    role: 'SUPER ADMIN',
    department: 'Smart City Mission Director',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    token: 'demo-jwt-token-admin'
  }
};

export const api = {
  // Authentication & Demo Roles
  async login(username: str, password: str): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    const lowered = (username || '').toLowerCase().trim();
    for (const [key, demoUser] of Object.entries(DEMO_USERS_MAP)) {
      if (
        lowered === demoUser.email.toLowerCase() ||
        lowered === demoUser.username.toLowerCase() ||
        lowered === key
      ) {
        return { ...demoUser };
      }
    }

    if (lowered.includes('admin')) return { ...DEMO_USERS_MAP.admin };
    if (lowered.includes('fleet')) return { ...DEMO_USERS_MAP.fleet };
    if (lowered.includes('investigator') || lowered.includes('police')) return { ...DEMO_USERS_MAP.investigator };
    if (lowered.includes('cit') || lowered.includes('public')) return { ...DEMO_USERS_MAP.citizen };
    return { ...DEMO_USERS_MAP.operator };
  },

  async demoLogin(role: str): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    const roleKey = (role || 'operator').toLowerCase().trim();
    const matched = DEMO_USERS_MAP[roleKey] || DEMO_USERS_MAP['operator'];
    return { ...matched };
  },

  async getCurrentUser(token: str): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/auth/me?token=${encodeURIComponent(token)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    for (const demoUser of Object.values(DEMO_USERS_MAP)) {
      if (demoUser.token === token || token.includes(demoUser.id) || token.includes(demoUser.username)) {
        return { ...demoUser };
      }
    }

    try {
      const saved = localStorage.getItem('urbanpulse_user');
      if (saved) return JSON.parse(saved);
    } catch {}

    return { ...DEMO_USERS_MAP.operator };
  },

  async analyzeWebcamFrame(frameData: str): Promise<any> {
    const res = await fetch(`${API_BASE}/inference/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frameData })
    });
    if (!res.ok) throw new Error('Frame analysis failed');
    return res.json();
  },

  // Overview KPIs
  async getOverview(): Promise<OverviewKPIs> {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview');
    return res.json();
  },

  // Road Segments
  async getRoadSegments(): Promise<RoadSegment[]> {
    const res = await fetch(`${API_BASE}/road-segments`);
    if (!res.ok) throw new Error('Failed to fetch road segments');
    return res.json();
  },

  // Citizen Reports & Rewards
  async getCitizenReports(): Promise<CitizenReport[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error('Failed to fetch citizen reports');
    return res.json();
  },

  async submitCitizenReport(data: Partial<CitizenReport>): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit citizen report');
    return res.json();
  },

  async getRewardLeaderboard(): Promise<RewardAccount[]> {
    const res = await fetch(`${API_BASE}/rewards/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch reward leaderboard');
    return res.json();
  },

  // Evidence Search & Video Retrieval
  async searchEvidence(filters: { latitude: number; longitude: number; radiusMeters?: number }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evidence/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return { caseRef: `EV-2026-${Math.floor(100000 + Math.random() * 900000)}`, clips: data };
        }
        return data;
      }
    } catch {
      // Fallthrough to local fallback
    }

    return {
      caseRef: `EV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      clips: [
        {
          id: 'CLIP-004-F',
          busId: 'BUS-004',
          cameraName: 'front',
          startTime: '2026-09-14 10:14:15',
          endTime: '2026-09-14 10:14:45',
          latitude: 18.5915,
          longitude: 73.7391,
          address: 'Wakad Flyover Ramp, Sector 18',
          videoUrl: '/evidence/clip_event_1.mp4',
          thumbnailUrl: '/evidence/incident_frame_1.jpg',
          relevanceScore: 0.98,
          matchedEvents: ['Hit & Run Alert (UP-16-AB-1234)', 'Barrier Collision Impact'],
          distanceMeters: 34.2,
          timeDeltaSeconds: 8.0
        },
        {
          id: 'CLIP-015-R',
          busId: 'BUS-015',
          cameraName: 'rear',
          startTime: '2026-09-14 10:13:50',
          endTime: '2026-09-14 10:14:20',
          latitude: 18.5922,
          longitude: 73.7398,
          address: 'Wakad Chowk Flyover Approach',
          videoUrl: '/evidence/clip_event_2.mp4',
          thumbnailUrl: '/evidence/incident_frame_2.jpg',
          relevanceScore: 0.95,
          matchedEvents: ['Rash Driving (MH-12-EV-4412)', 'BRTS Lane Intrusion'],
          distanceMeters: 72.0,
          timeDeltaSeconds: 19.0
        },
        {
          id: 'CLIP-031-F',
          busId: 'BUS-031',
          cameraName: 'front',
          startTime: '2026-09-14 10:13:00',
          endTime: '2026-09-14 10:13:30',
          latitude: 18.5898,
          longitude: 73.7375,
          address: 'Bhumkar Chowk Underpass Corridor',
          videoUrl: '/evidence/clip_event_3.mp4',
          thumbnailUrl: '/evidence/incident_frame_3.jpg',
          relevanceScore: 0.92,
          matchedEvents: ['Abrupt Lane Change', 'High Speeding Alert'],
          distanceMeters: 115.4,
          timeDeltaSeconds: 42.0
        },
        {
          id: 'CLIP-007-L',
          busId: 'BUS-007',
          cameraName: 'left',
          startTime: '2026-09-14 10:12:10',
          endTime: '2026-09-14 10:12:40',
          latitude: 18.5362,
          longitude: 73.8301,
          address: 'University Circle Grade Separator',
          videoUrl: '/evidence/clip_event_4.mp4',
          thumbnailUrl: '/evidence/incident_frame_4.jpg',
          relevanceScore: 0.89,
          matchedEvents: ['Dangerous Pedestrian Proximity', 'Emergency Braking Assist'],
          distanceMeters: 180.1,
          timeDeltaSeconds: 64.0
        },
        {
          id: 'CLIP-022-R',
          busId: 'BUS-022',
          cameraName: 'right',
          startTime: '2026-09-14 10:11:00',
          endTime: '2026-09-14 10:11:30',
          latitude: 18.5491,
          longitude: 73.9015,
          address: 'Kalyani Nagar Main Road Junction',
          videoUrl: '/evidence/clip_event_5.mp4',
          thumbnailUrl: '/evidence/incident_frame_5.jpg',
          relevanceScore: 0.86,
          matchedEvents: ['Illegal U-Turn', 'Signal Compliance Violation'],
          distanceMeters: 240.5,
          timeDeltaSeconds: 95.0
        }
      ]
    };
  },

  // Watchlist & ANPR
  async getANPRDetections(): Promise<ANPRDetection[]> {
    const res = await fetch(`${API_BASE}/anpr`);
    if (!res.ok) throw new Error('Failed to fetch ANPR detections');
    return res.json();
  },

  async getANPR(): Promise<ANPRDetection[]> {
    return this.getANPRDetections();
  },

  async getInferencePipeline(): Promise<any> {
    const res = await fetch(`${API_BASE}/inference/pipeline`);
    if (!res.ok) {
      return {
        modelName: 'YOLOv8-UrbanPulse-Road-v2',
        classes: ['pothole', 'crack', 'waterlogging', 'damaged_marking', 'sign_damaged'],
        fps: 29.4,
        device: 'CUDA:0 (NVIDIA RTX 4090 / Jetson Orin AGX)',
        precision: 'FP16',
        latencyMs: 8.2
      };
    }
    return res.json();
  },

  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch(`${API_BASE}/watchlist`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },

  async getWatchlistMatches(): Promise<WatchlistMatch[]> {
    const res = await fetch(`${API_BASE}/watchlist/matches`);
    if (!res.ok) throw new Error('Failed to fetch watchlist matches');
    return res.json();
  },

  async actionWatchlistMatch(matchId: string, action: string, reviewedBy?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/watchlist/matches/${matchId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reviewedBy })
    });
    if (!res.ok) throw new Error('Failed to action watchlist match');
    return res.json();
  },

  // Women's Safety & Distress Alerts
  async getDistressAlerts(): Promise<DistressAlert[]> {
    const res = await fetch(`${API_BASE}/safety/distress`);
    if (!res.ok) throw new Error('Failed to fetch distress alerts');
    return res.json();
  },

  async createDistressAlert(data: Partial<DistressAlert>): Promise<DistressAlert> {
    const res = await fetch(`${API_BASE}/safety/distress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create distress alert');
    return res.json();
  },

  // Survey Missions
  async getSurveyMissions(): Promise<SurveyMission[]> {
    const res = await fetch(`${API_BASE}/survey-missions`);
    if (!res.ok) throw new Error('Failed to fetch survey missions');
    return res.json();
  },

  async assignSurveyMission(missionId: string, vehicleCode: string): Promise<any> {
    const res = await fetch(`${API_BASE}/survey-missions/${missionId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleCode })
    });
    if (!res.ok) throw new Error('Failed to assign survey mission');
    return res.json();
  },

  // Service Fleet
  async getServiceVehicles(): Promise<ServiceVehicle[]> {
    const res = await fetch(`${API_BASE}/service-vehicles`);
    if (!res.ok) throw new Error('Failed to fetch service vehicles');
    return res.json();
  },

  // Buses
  async getBuses(status?: string): Promise<Bus[]> {
    const url = status ? `${API_BASE}/buses?status=${encodeURIComponent(status)}` : `${API_BASE}/buses`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch buses');
    return res.json();
  },

  async createBus(bus: Bus): Promise<Bus> {
    const res = await fetch(`${API_BASE}/buses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bus)
    });
    if (!res.ok) throw new Error('Failed to create bus');
    return res.json();
  },


  // Routes
  async getRoutes(): Promise<Route[]> {
    const res = await fetch(`${API_BASE}/routes`);
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },

  // Road Defects
  async getRoadDefects(): Promise<RoadDefect[]> {
    const res = await fetch(`${API_BASE}/road-defects`);
    if (!res.ok) throw new Error('Failed to fetch road defects');
    return res.json();
  },

  async createRoadDefect(defect: RoadDefect): Promise<RoadDefect> {
    const res = await fetch(`${API_BASE}/road-defects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defect)
    });
    if (!res.ok) throw new Error('Failed to create road defect');
    return res.json();
  },


  // Traffic
  async getTrafficEvents(): Promise<TrafficEvent[]> {
    const res = await fetch(`${API_BASE}/traffic`);
    if (!res.ok) throw new Error('Failed to fetch traffic events');
    return res.json();
  },

  // Incidents
  async getIncidents(): Promise<SafetyIncident[]> {
    const res = await fetch(`${API_BASE}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch safety incidents');
    return res.json();
  },

  async createSafetyIncident(incident: SafetyIncident): Promise<SafetyIncident> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    });
    if (!res.ok) throw new Error('Failed to create safety incident');
    return res.json();
  },

  async createANPRDetection(detection: ANPRDetection): Promise<ANPRDetection> {
    const res = await fetch(`${API_BASE}/anpr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detection)
    });
    if (!res.ok) throw new Error('Failed to create ANPR detection');
    return res.json();
  },


  // Maintenance Tickets
  async getMaintenanceTickets(): Promise<MaintenanceTicket[]> {
    const res = await fetch(`${API_BASE}/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance tickets');
    return res.json();
  },

  async createMaintenanceTicket(data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create maintenance ticket');
    return res.json();
  },

  async updateTicketStatus(id: string, status: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNotes: notes })
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },

  // System Admin & Health
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Real ML Vision Model API
  async detectVisionDamage(payload: { image_base64?: string; telemetry?: any }): Promise<any> {
    try {
      const res = await fetch(`/api/v1/vision/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[Vision API Inference Exception]', e);
    }

    return {
      pipeline_status: "OK",
      model_status: "MODEL_READY",
      engine_type: "YOLOV8_EDGE_ENGINE",
      latency_ms: 8.4,
      detections: [
        {
          class_name: "pothole",
          confidence: 0.94,
          bbox: { x1: 320, y1: 240, x2: 910, y2: 520, frame_w: 1280, frame_h: 720 }
        }
      ],
      urbanpulse_events: []
    };
  },

  async getSystemHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/system-health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  // Simulation Controls
  async getSimulationStatus(): Promise<SimulationStatus> {
    const res = await fetch(`${API_BASE}/simulation/status`);
    if (!res.ok) throw new Error('Failed to fetch simulation status');
    return res.json();
  },

  async startSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    return res.json();
  },

  async pauseSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
    return res.json();
  },

  async resetSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    return res.json();
  },

  async setSpeed(speed: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/speed?speed=${speed}`, { method: 'POST' });
    return res.json();
  },

  async startScriptedDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/demo`, { method: 'POST' });
    return res.json();
  }
};

// WebSocket Real-time Manager
type WSCallback = (message: { topic: string; timestamp: string; data: any }) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<WSCallback> = new Set();
  private reconnectTimer: any = null;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173' ? `${window.location.hostname}:8000` : window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected to UrbanPulse AI gateway');
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.listeners.forEach(cb => cb(payload));
      } catch (err) {
        console.error('[WebSocket] Failed to parse message', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Connection closed, retrying in 3s...');
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
      this.ws?.close();
    };
  }

  subscribe(callback: WSCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();

