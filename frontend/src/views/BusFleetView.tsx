import React, { useState } from 'react';
import type { Bus } from '../types';
import { Search, ArrowUpDown, Plus, Sparkles, Cpu, Bus as BusIcon } from 'lucide-react';
import { api } from '../services/api';

interface BusFleetViewProps {
  buses: Bus[];
  onSelectBus: (bus: Bus) => void;
  onAddBus?: (bus: Bus) => void;
}

type SortField = 'id' | 'speed' | 'status';
type SortOrder = 'asc' | 'desc';

const DEMO_BUSES: Bus[] = [
  {
    id: 'BUS-004',
    fleetNumber: 'PMPML-4004',
    routeId: 'RT-101',
    routeName: 'Wakad - Hinjawadi IT Corridor Express',
    status: 'Active',
    latitude: 18.5985,
    longitude: 73.7621,
    speed: 42.5,
    heading: 145,
    cameraHealth: 'Optimal',
    gpsHealth: 'High Accuracy (RTK)',
    networkStatus: '5G Connected',
    edgeFps: 29.8,
    gpuUtilization: 64,
    lastEvent: 'Pothole classified with 96% confidence (DEF-0001)',
    lastUpdateTime: '2026-09-14 10:14:02',
    currentPassengerLoad: 38,
    cameras: [
      { id: 'cam-front', name: 'Front Asphalt HD', status: 'Active', fps: 30, resolution: '1080p' },
      { id: 'cam-left', name: 'Left Lane Scanner', status: 'Active', fps: 30, resolution: '1080p' },
      { id: 'cam-right', name: 'Right Lane Scanner', status: 'Active', fps: 30, resolution: '1080p' },
      { id: 'cam-rear', name: 'Rear Tailgate ANPR', status: 'Active', fps: 30, resolution: '1080p' }
    ],
    vehicleType: 'Public Transit Electric Bus'
  },
  {
    id: 'BUS-007',
    fleetNumber: 'PMPML-4007',
    routeId: 'RT-101',
    routeName: 'Pune University - Shivajinagar Feeder',
    status: 'Active',
    latitude: 18.5362,
    longitude: 73.8301,
    speed: 38.2,
    heading: 88,
    cameraHealth: 'Optimal',
    gpsHealth: 'High Accuracy (RTK)',
    networkStatus: '5G Connected',
    edgeFps: 29.4,
    gpuUtilization: 58,
    lastEvent: 'Jaywalking pedestrian warning logged (INC-0002)',
    lastUpdateTime: '2026-09-14 10:10:15',
    currentPassengerLoad: 45,
    cameras: [],
    vehicleType: 'Public Transit Electric Bus'
  },
  {
    id: 'BUS-012',
    fleetNumber: 'PMPML-4012',
    routeId: 'RT-101',
    routeName: 'Aundh Bremen Chowk - SB Road Loop',
    status: 'Warning',
    latitude: 18.5583,
    longitude: 73.8074,
    speed: 24.0,
    heading: 210,
    cameraHealth: 'Minor Glitch (CAM-R)',
    gpsHealth: 'High Accuracy (RTK)',
    networkStatus: '5G Connected',
    edgeFps: 27.1,
    gpuUtilization: 72,
    lastEvent: 'Surface cracking cross-verified (DEF-0002)',
    lastUpdateTime: '2026-09-14 09:45:12',
    currentPassengerLoad: 52,
    cameras: [],
    vehicleType: 'Public Transit Electric Bus'
  },
  {
    id: 'BUS-015',
    fleetNumber: 'PMPML-4015',
    routeId: 'RT-102',
    routeName: 'Deccan - Karve Road Metro Spine',
    status: 'Active',
    latitude: 18.5039,
    longitude: 73.8288,
    speed: 31.6,
    heading: 95,
    cameraHealth: 'Optimal',
    gpsHealth: 'High Accuracy (RTK)',
    networkStatus: '5G Connected',
    edgeFps: 30.0,
    gpuUtilization: 61,
    lastEvent: 'Waterlogging patch tagged (DEF-0004)',
    lastUpdateTime: '2026-09-14 09:40:05',
    currentPassengerLoad: 29,
    cameras: [],
    vehicleType: 'Public Transit Electric Bus'
  },
  {
    id: 'BUS-022',
    fleetNumber: 'PMPML-4022',
    routeId: 'RT-102',
    routeName: 'Swargate - Railway Station Hub Link',
    status: 'Active',
    latitude: 18.5204,
    longitude: 73.8567,
    speed: 28.9,
    heading: 180,
    cameraHealth: 'Optimal',
    gpsHealth: 'High Accuracy (RTK)',
    networkStatus: '5G Connected',
    edgeFps: 29.2,
    gpuUtilization: 55,
    lastEvent: 'Damaged traffic sign post detected (DEF-0005)',
    lastUpdateTime: '2026-09-14 08:20:00',
    currentPassengerLoad: 41,
    cameras: [],
    vehicleType: 'Public Transit Electric Bus'
  }
];

export const BusFleetView: React.FC<BusFleetViewProps> = ({
  buses: propBuses,
  onSelectBus,
  onAddBus
}) => {
  const [localBuses, setLocalBuses] = useState<Bus[]>(DEMO_BUSES);
  const buses = (propBuses && propBuses.length > 0) ? propBuses : localBuses;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'OFFLINE' | 'WARNING' | 'EVENTS'>('ALL');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [notification, setNotification] = useState<string | null>(null);

  // Filtering
  const filteredBuses = buses.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = b.id.toLowerCase().includes(q) ||
                          b.fleetNumber.toLowerCase().includes(q) ||
                          b.routeName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return b.status === 'Active';
    if (statusFilter === 'WARNING') return b.status === 'Warning';
    if (statusFilter === 'OFFLINE') return b.status === 'Idle' || b.status === 'Maintenance';
    if (statusFilter === 'EVENTS') return b.lastEvent && b.lastEvent.length > 0;
    return true;
  });

  // Sorting
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    if (sortField === 'speed') {
      return sortOrder === 'asc' ? a.speed - b.speed : b.speed - a.speed;
    }
    if (sortField === 'status') {
      return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDeployDemoBus = async () => {
    const nextIdx = Math.floor(100 + Math.random() * 900);
    const busId = `BUS-${nextIdx}`;
    const fleetNum = `PMPML-${4000 + nextIdx}`;
    const routes = [
      { id: 'RT-101', name: 'Wakad - Hinjawadi IT Corridor' },
      { id: 'RT-102', name: 'Nagar Road - Viman Nagar Line' },
      { id: 'RT-103', name: 'Satara Road - Katraj Spine' },
      { id: 'RT-104', name: 'Paud Road - Kothrud Express' }
    ];
    const r = routes[Math.floor(Math.random() * routes.length)];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newBus: Bus = {
      id: busId,
      fleetNumber: fleetNum,
      routeId: r.id,
      routeName: r.name,
      status: 'Active',
      latitude: 18.5204 + (Math.random() - 0.5) * 0.08,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.08,
      speed: parseFloat((32.0 + Math.random() * 18.0).toFixed(1)),
      heading: Math.floor(Math.random() * 360),
      cameraHealth: 'Optimal',
      gpsHealth: 'High Accuracy (RTK)',
      networkStatus: '5G Connected',
      edgeFps: parseFloat((28.5 + Math.random() * 1.5).toFixed(1)),
      gpuUtilization: Math.floor(52 + Math.random() * 25),
      lastEvent: 'Jetson Orin edge neural vision active',
      lastUpdateTime: nowStr,
      currentPassengerLoad: Math.floor(20 + Math.random() * 35),
      cameras: [],
      vehicleType: 'Public Transit Electric Bus'
    };

    try {
      await api.createBus(newBus);
    } catch {
      // Local fallback
    }

    if (onAddBus) {
      onAddBus(newBus);
    } else {
      setLocalBuses(prev => [newBus, ...prev]);
    }

    setNotification(`[FLEET DEPLOYED] Electric Bus ${busId} (${fleetNum}) deployed on ${r.name} with Jetson Orin AGX AI!`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleSimulateTelemetry = () => {
    setLocalBuses(prev => prev.map(b => ({
      ...b,
      speed: parseFloat((Math.max(15, b.speed + (Math.random() - 0.5) * 8)).toFixed(1)),
      edgeFps: parseFloat((28.8 + (Math.random() - 0.5) * 1.2).toFixed(1)),
      gpuUtilization: Math.floor(Math.min(92, Math.max(45, b.gpuUtilization + Math.floor((Math.random() - 0.5) * 6))))
    })));
    setNotification('[TELEMETRY SYNCED] Real-time Jetson Orin AGX 30 FPS inference & 5G telemetry refreshed across active fleet');
    setTimeout(() => setNotification(null), 4000);
  };

  const activeCount = buses.filter(b => b.status === 'Active').length;
  const warningCount = buses.filter(b => b.status === 'Warning').length;
  const offlineCount = buses.filter(b => b.status === 'Idle' || b.status === 'Maintenance').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-theme-bg overflow-hidden font-mono select-none text-xs">
      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Top Filter & Operations Toolbar */}
      <div className="h-11 bg-theme-surface border-b border-theme-border px-3 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary flex items-center gap-1.5 whitespace-nowrap">
            <BusIcon className="w-4 h-4 text-brand" />
            FLEET TELEMETRY INVENTORY
          </span>
          
          {/* Quick One-Click Filters */}
          <div className="flex items-center gap-1">
            {[
              { key: 'ALL', label: `ALL (${buses.length})` },
              { key: 'ACTIVE', label: `ACTIVE (${activeCount})` },
              { key: 'WARNING', label: `WARNING (${warningCount})` },
              { key: 'OFFLINE', label: `OFFLINE (${offlineCount})` },
              { key: 'EVENTS', label: 'HAS EVENTS' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key as any)}
                className={`px-2 py-0.5 text-[10px] border rounded-none transition-colors ${
                  statusFilter === f.key
                    ? 'bg-theme-elevated text-brand font-bold border-brand'
                    : 'bg-theme-panel text-theme-muted border-theme-border hover:text-theme-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDeployDemoBus}
            className="px-2.5 py-1 text-[11px] font-bold bg-brand/20 border border-brand/50 text-brand hover:bg-brand/30 flex items-center gap-1 transition"
            title="Deploy a new AI-equipped electric bus"
          >
            <Plus className="w-3.5 h-3.5" />
            + DEPLOY DEMO BUS
          </button>

          <button
            onClick={handleSimulateTelemetry}
            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 hover:bg-emerald-900/60 flex items-center gap-1 transition"
            title="Simulate live 5G telemetry pulse"
          >
            <Cpu className="w-3.5 h-3.5" />
            + SIMULATE TELEMETRY
          </button>

          <div className="flex items-center gap-1.5 bg-theme-panel border border-theme-border px-2 py-0.5 text-xs rounded-sm">
            <Search className="w-3.5 h-3.5 text-theme-muted" />
            <input
              type="text"
              placeholder="Search bus ID / route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-theme-primary placeholder-theme-muted focus:outline-none text-[11px] w-36"
            />
          </div>

          <span className="text-[10px] text-theme-muted hidden sm:inline whitespace-nowrap">
            <strong>{activeCount}</strong> JETSON ORIN UNITS SYNCED
          </span>
        </div>
      </div>

      {/* Professional Dense Fleet Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-theme-panel text-theme-muted text-[10px] uppercase border-b border-theme-border sticky top-0 z-10">
            <tr>
              <th 
                onClick={() => toggleSort('id')} 
                className="py-2 px-3 cursor-pointer hover:text-theme-primary"
              >
                <div className="flex items-center gap-1">
                  <span>BUS ID</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th className="py-2 px-3">ROUTE</th>
              <th 
                onClick={() => toggleSort('status')} 
                className="py-2 px-3 cursor-pointer hover:text-theme-primary"
              >
                <div className="flex items-center gap-1">
                  <span>STATUS</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th 
                onClick={() => toggleSort('speed')} 
                className="py-2 px-3 cursor-pointer hover:text-theme-primary text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>SPEED</span>
                  <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                </div>
              </th>
              <th className="py-2 px-3">GPS COORDINATES</th>
              <th className="py-2 px-3 text-center">CAMERAS</th>
              <th className="py-2 px-3 text-right">EDGE FPS</th>
              <th className="py-2 px-3">EDGE DEVICE</th>
              <th className="py-2 px-3">LAST TRANSMISSION EVENT</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border text-theme-secondary text-[11px]">
            {sortedBuses.map(bus => {
              const isActive = bus.status === 'Active';
              const isWarning = bus.status === 'Warning';

              return (
                <tr
                  key={bus.id}
                  onClick={() => onSelectBus(bus)}
                  className={`hover:bg-theme-elevated cursor-pointer transition-colors ${
                    isWarning ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-bold text-theme-primary">{bus.id}</td>
                  <td className="py-2 px-3 text-theme-primary truncate max-w-xs font-semibold">
                    {bus.routeId} • {bus.routeName}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-500' : (isWarning ? 'bg-amber-500' : 'bg-slate-400')
                      }`}></span>
                      <span className={`font-bold ${
                        isActive ? 'text-emerald-500' : (isWarning ? 'text-amber-500' : 'text-theme-muted')
                      }`}>
                        {bus.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-theme-primary">
                    {bus.speed} km/h
                  </td>
                  <td className="py-2 px-3 text-theme-muted text-[10px]">
                    {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-emerald-500 font-bold">4/4</span>
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-500 font-bold">
                    {bus.edgeFps}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-theme-primary text-[10px]">
                      JETSON ORIN ({bus.gpuUtilization}%)
                    </span>
                  </td>
                  <td className="py-2 px-3 text-theme-muted truncate max-w-xs">
                    {bus.lastEvent || 'Routine arterial corridor scan'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button className="text-[10px] text-theme-primary hover:text-brand underline">
                      INSPECT 4-CAM →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedBuses.length === 0 && (
          <div className="p-8 text-center text-theme-muted font-mono text-xs">
            No fleet vehicles match filter "{statusFilter}" or query "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

