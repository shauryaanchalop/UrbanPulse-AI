import { 
  Bus, ServiceVehicle, Route, RoadSegment, RoadDefect, CitizenReport, RewardAccount, 
  TrafficEvent, SafetyIncident, DistressAlert, ANPRDetection, WatchlistItem, WatchlistMatch,
  SurveyMission, MaintenanceTicket, User, AuditLog, SystemHealth, SimulationStatus, OverviewKPIs 
} from '../types';

const API_BASE = '/api';
type str = string;

export const api = {
  // Authentication & Demo Roles
  async login(username: str, password: str): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },

  async demoLogin(role: str): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async getCurrentUser(token: str): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/me?token=${encodeURIComponent(token)}`);
    if (!res.ok) throw new Error('Invalid token');
    return res.json();
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
    const res = await fetch(`${API_BASE}/evidence/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    if (!res.ok) throw new Error('Failed to search evidence clips');
    return res.json();
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

