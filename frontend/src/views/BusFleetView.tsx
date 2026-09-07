import React, { useState } from 'react';
import type { Bus } from '../types';
import { Search, ArrowUpDown, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface BusFleetViewProps {
  buses: Bus[];
  onSelectBus: (bus: Bus) => void;
}

type SortField = 'id' | 'speed' | 'status';
type SortOrder = 'asc' | 'desc';

export const BusFleetView: React.FC<BusFleetViewProps> = ({ buses, onSelectBus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'OFFLINE' | 'WARNING' | 'EVENTS'>('ALL');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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

  const activeCount = buses.filter(b => b.status === 'Active').length;
  const warningCount = buses.filter(b => b.status === 'Warning').length;
  const offlineCount = buses.filter(b => b.status === 'Idle' || b.status === 'Maintenance').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-theme-bg overflow-hidden font-mono select-none text-xs">
      {/* Top Filter & Operations Toolbar */}
      <div className="h-10 bg-theme-surface border-b border-theme-border px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary">FLEET TELEMETRY INVENTORY</span>
          
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-theme-panel border border-theme-border px-2 py-0.5 text-xs rounded-sm">
            <Search className="w-3.5 h-3.5 text-theme-muted" />
            <input
              type="text"
              placeholder="Search bus ID / route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-theme-primary placeholder-theme-muted focus:outline-none text-[11px] w-48"
            />
          </div>

          <span className="text-[10px] text-theme-muted hidden sm:inline">
            32 JETSON ORIN UNITS SYNCED
          </span>
        </div>
      </div>

      {/* Professional Dense Fleet Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-theme-panel text-theme-muted text-[10px] uppercase border-b border-theme-border sticky top-0">
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
