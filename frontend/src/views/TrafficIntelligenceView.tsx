import React, { useState } from 'react';
import type { TrafficEvent } from '../types';
import { ArrowRight, Activity, TrendingDown } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

interface TrafficIntelligenceViewProps {
  trafficEvents: TrafficEvent[];
}

export const TrafficIntelligenceView: React.FC<TrafficIntelligenceViewProps> = ({ trafficEvents }) => {
  const [selectedOrigin, setSelectedOrigin] = useState('Hinjawadi IT Hub');
  const [selectedDest, setSelectedDest] = useState('Shivajinagar Interchange');

  const hourlyData = [
    { hour: '06:00', volume: 240, avgSpeed: 42 },
    { hour: '07:00', volume: 480, avgSpeed: 36 },
    { hour: '08:00', volume: 920, avgSpeed: 21 },
    { hour: '09:00', volume: 1150, avgSpeed: 16 },
    { hour: '10:00', volume: 1040, avgSpeed: 18 },
    { hour: '11:00', volume: 760, avgSpeed: 26 },
    { hour: '12:00', volume: 620, avgSpeed: 32 },
    { hour: '13:00', volume: 590, avgSpeed: 33 },
    { hour: '14:00', volume: 680, avgSpeed: 30 },
    { hour: '15:00', volume: 810, avgSpeed: 25 },
    { hour: '16:00', volume: 1020, avgSpeed: 19 },
    { hour: '17:00', volume: 1240, avgSpeed: 14 },
    { hour: '18:00', volume: 1310, avgSpeed: 13 },
  ];

  const odDelayInfo = {
    normalMins: 28,
    currentMins: 43,
    delayMins: 15,
    contributingAnomaly: 'Pothole cluster & grade separation bottleneck near Wakad Bridge (RT-101)'
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-y-auto font-mono text-xs select-none">
      {/* Top Corridor Telemetry Strip */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0">
        <span className="font-bold text-theme-primary">ARTERIAL CORRIDOR TRAFFIC & VELOCITY METRICS</span>
        <div className="flex items-center gap-3 text-[11px] text-graphite-400">
          <span>AGGREGATED VEHICLES: <strong className="text-theme-primary font-mono">18,420</strong></span>
          <span>|</span>
          <span>CORRIDOR CHOKE POINTS: <strong className="text-brand font-mono">8</strong></span>
          <span>|</span>
          <span>AVERAGE VELOCITY: <strong className="text-emerald-500 font-mono">26.4 KM/H</strong></span>
        </div>
      </div>

      {/* Simulated OD Route Delay Strip */}
      <div className="bg-graphite-950 border-b border-graphite-700 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-graphite-400 uppercase">
            ORIGIN-DESTINATION (OD) ROUTE TRAVEL TIME ESTIMATOR [PROTOTYPE SIMULATION]
          </span>
          <span className="text-[10px] text-graphite-500">DYNAMIC RE-ROUTING TELEMETRY</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-graphite-900 p-2.5 border border-graphite-700 rounded-sm">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-graphite-950 border border-graphite-700 text-theme-primary px-2 py-1 text-xs rounded-sm"
            >
              <option>Hinjawadi IT Hub</option>
              <option>Kothrud Depot</option>
              <option>Katraj Terminus</option>
              <option>Airport Terminal</option>
            </select>
            <ArrowRight className="w-3.5 h-3.5 text-graphite-500" />
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="bg-graphite-950 border border-graphite-700 text-theme-primary px-2 py-1 text-xs rounded-sm"
            >
              <option>Shivajinagar Interchange</option>
              <option>Pune Railway Station</option>
              <option>Swargate Multimodal</option>
              <option>PCMC Municipal Hub</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>BASELINE: <b className="text-theme-primary">{odDelayInfo.normalMins}m</b></span>
            <span>CURRENT: <b className="text-brand font-bold">{odDelayInfo.currentMins}m</b></span>
            <span>DELAY: <b className="text-amber-500">+{odDelayInfo.delayMins}m</b></span>
          </div>
        </div>

        <div className="text-[10px] text-graphite-400">
          IDENTIFIED IMPEDANCE FACTOR: <span className="text-theme-primary font-bold">{odDelayInfo.contributingAnomaly}</span>
        </div>
      </div>

      {/* Recharts: Hourly Volume (Steel / Red) & Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-b border-graphite-700">
        {/* Hourly Volume Bar Chart */}
        <div className="bg-graphite-900 border border-graphite-700 p-3 flex flex-col rounded-sm">
          <div className="text-[10px] text-graphite-400 font-bold uppercase mb-2">
            HOURLY TRANSIT VOLUME (OBSERVED CARS & TWO-WHEELERS)
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={9} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '10px' }} />
                <Bar dataKey="volume" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Velocity Trend Area Chart */}
        <div className="bg-graphite-900 border border-graphite-700 p-3 flex flex-col rounded-sm">
          <div className="text-[10px] text-graphite-400 font-bold uppercase mb-2">
            FLEET AVERAGE SPEED BY HOUR (KM/H)
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={9} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '10px' }} />
                <Area type="monotone" dataKey="avgSpeed" stroke="#10B981" fill="#10B98120" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Congestion Hotspots Table */}
      <div className="flex-1 p-3 flex flex-col">
        <div className="text-[10px] font-bold text-graphite-400 uppercase mb-1">
          CORRIDOR CONGESTION LOG (SORTED BY DELAY SCORE)
        </div>
        <div className="border border-graphite-700 bg-graphite-900 overflow-x-auto rounded-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-graphite-950 text-graphite-400 text-[10px] uppercase border-b border-graphite-700">
              <tr>
                <th className="py-2 px-3">CORRIDOR NAME</th>
                <th className="py-2 px-3">CONGESTION LEVEL</th>
                <th className="py-2 px-3">CURRENT VELOCITY</th>
                <th className="py-2 px-3">DELAY</th>
                <th className="py-2 px-3">EST. VEHICLES</th>
                <th className="py-2 px-3">REPORTING BUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
              {trafficEvents.slice(0, 10).map(evt => (
                <tr key={evt.id} className="hover:bg-graphite-850 transition">
                  <td className="py-2 px-3 font-semibold text-theme-primary">{evt.corridorName}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.2 text-[9px] border rounded-none ${
                      evt.congestionLevel === 'Standstill' ? 'text-red-500 border-red-800/40 bg-red-500/10 font-bold' : (evt.congestionLevel === 'Heavy' ? 'text-amber-500 border-amber-800/40 bg-amber-500/10 font-bold' : 'text-graphite-400 border-graphite-700')
                    }`}>
                      {evt.congestionLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-emerald-500 font-bold font-mono">{evt.averageSpeedKmH} km/h</td>
                  <td className="py-2 px-3 text-amber-500 font-mono">+{evt.delayMinutes} min</td>
                  <td className="py-2 px-3 text-graphite-400 font-mono">{evt.affectedVehiclesEstimate}</td>
                  <td className="py-2 px-3 text-theme-primary font-bold font-mono">{evt.observedByBusId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
