import { 
  Bus, Route, RoadDefect, TrafficEvent, SafetyIncident, 
  ANPRDetection, MaintenanceTicket, SystemHealth, SimulationStatus, OverviewKPIs 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Overview KPIs
  async getOverview(): Promise<OverviewKPIs> {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview');
    return res.json();
  },

  // Buses
  async getBuses(status?: string): Promise<Bus[]> {
    const url = status ? `${API_BASE}/buses?status=${encodeURIComponent(status)}` : `${API_BASE}/buses`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch buses');
    return res.json();
  },

  async getBus(id: string): Promise<Bus> {
    const res = await fetch(`${API_BASE}/buses/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch bus ${id}`);
    return res.json();
  },

  // Routes
  async getRoutes(): Promise<Route[]> {
    const res = await fetch(`${API_BASE}/routes`);
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },

  // Road Defects
  async getRoadDefects(filters?: { defectType?: string; severity?: string; status?: string }): Promise<RoadDefect[]> {
    const params = new URLSearchParams();
    if (filters?.defectType) params.append('defectType', filters.defectType);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    
    const url = `${API_BASE}/road-defects${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch road defects');
    return res.json();
  },

  async getRoadDefect(id: string): Promise<RoadDefect> {
    const res = await fetch(`${API_BASE}/road-defects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch defect');
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

  // ANPR
  async getANPR(): Promise<ANPRDetection[]> {
    const res = await fetch(`${API_BASE}/anpr`);
    if (!res.ok) throw new Error('Failed to fetch ANPR events');
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

  // System Health
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
  },

  async getInferencePipeline(): Promise<any> {
    const res = await fetch(`${API_BASE}/inference/pipeline`);
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
