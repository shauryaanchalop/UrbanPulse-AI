import React, { useState } from 'react';
import type { RoadDefect } from '../types';
import { Search, CheckCheck } from 'lucide-react';

interface RoadIntelligenceViewProps {
  defects: RoadDefect[];
  onSelectDefect: (defect: RoadDefect) => void;
}

export const RoadIntelligenceView: React.FC<RoadIntelligenceViewProps> = ({
  defects,
  onSelectDefect
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const defectTypes = ['ALL', 'Pothole', 'Waterlogging', 'Damaged Sign', 'Missing Road Marking', 'Broken Divider'];

  const filteredDefects = defects.filter(d => {
    const matchesType = filterType === 'ALL' || d.defectType === filterType;
    const matchesSearch = d.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const criticalCount = defects.filter(d => d.severity === 'Critical').length;
  const verifiedCount = defects.filter(d => d.status === 'Cross-verified').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden font-mono select-none">
      {/* Top Telemetry & Filter Strip */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary">ASPHALT & INFRASTRUCTURE DEFECT INVENTORY</span>
          <div className="flex items-center gap-1">
            <span className="text-graphite-400">TYPE:</span>
            {defectTypes.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 text-[10px] border rounded-none ${
                  filterType === t
                    ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600'
                    : 'bg-graphite-950 text-graphite-400 border-graphite-700 hover:bg-graphite-800'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-graphite-950 border border-graphite-700 px-2 py-0.5 text-xs">
            <Search className="w-3.5 h-3.5 text-graphite-400" />
            <input
              type="text"
              placeholder="SEARCH ADDRESS / ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-theme-primary placeholder-graphite-500 focus:outline-none text-[11px] w-44"
            />
          </div>

          <span className="text-[10px] text-graphite-400">
            TOTAL: <strong className="text-theme-primary">{defects.length}</strong> | 
            CRITICAL: <strong className="text-brand">{criticalCount}</strong> | 
            CROSS-VERIFIED: <strong className="text-emerald-500">{verifiedCount}</strong>
          </span>
        </div>
      </div>

      {/* Multi-Bus Corroboration Callout Strip */}
      <div className="bg-graphite-950 border-b border-graphite-700 px-3 py-1.5 flex items-center justify-between text-xs text-theme-secondary">
        <div className="flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-emerald-500">MULTI-BUS SPATIO-TEMPORAL GATE:</span>
          <span className="text-theme-secondary text-[11px]">
            Repeated independent observations within ±25m spatial thresholds upgrade confidence and trigger municipal Priority P1 work orders.
          </span>
        </div>
        <div className="text-[10px] text-graphite-400 font-bold">
          FALSE POSITIVE SUPPRESSION: 99.1%
        </div>
      </div>

      {/* Defect Inventory Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0">
            <tr>
              <th className="py-2 px-3">DEFECT ID</th>
              <th className="py-2 px-3">ANOMALY TYPE</th>
              <th className="py-2 px-3">SEVERITY</th>
              <th className="py-2 px-3">CONFIDENCE</th>
              <th className="py-2 px-3">LOCATION / CORRIDOR</th>
              <th className="py-2 px-3">FIRST SEEN</th>
              <th className="py-2 px-3">LAST CONFIRMED</th>
              <th className="py-2 px-3">OBSERVATIONS</th>
              <th className="py-2 px-3">VERIFICATION STATE</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
            {filteredDefects.map(d => {
              const isVerified = d.status === 'Cross-verified';
              const isCritical = d.severity === 'Critical';

              return (
                <tr
                  key={d.id}
                  onClick={() => onSelectDefect(d)}
                  className="hover:bg-graphite-850 cursor-pointer transition"
                >
                  <td className="py-2 px-3 font-bold font-mono text-theme-primary">{d.id}</td>
                  <td className="py-2 px-3 font-semibold text-theme-primary">{d.defectType}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold border rounded-none ${
                      isCritical ? 'text-red-500 border-red-800/40 bg-red-500/10' : (d.severity === 'High' ? 'text-amber-500 border-amber-800/40 bg-amber-500/10' : 'text-graphite-400 border-graphite-700')
                    }`}>
                      {d.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-emerald-500 font-bold font-mono">{(d.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 text-theme-secondary truncate max-w-xs">{d.address}</td>
                  <td className="py-2 px-3 text-graphite-500 text-[10px] font-mono">{d.firstSeen.split(' ')[0]}</td>
                  <td className="py-2 px-3 text-graphite-400 text-[10px] font-mono">{d.lastSeen.split(' ')[1] || d.lastSeen}</td>
                  <td className="py-2 px-3 text-theme-primary font-mono">{d.timesConfirmed} BUS PASSES</td>
                  <td className="py-2 px-3">
                    {isVerified ? (
                      <span className="text-[10px] font-bold text-emerald-500 border border-emerald-800/40 bg-emerald-500/10 px-1.5 py-0.5 inline-flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        CROSS-VERIFIED
                      </span>
                    ) : (
                      <span className="text-graphite-500 text-[10px]">PENDING SECOND BUS</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button className="text-[10px] text-theme-secondary hover:text-theme-primary hover:underline">
                      INSPECT ▶
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
