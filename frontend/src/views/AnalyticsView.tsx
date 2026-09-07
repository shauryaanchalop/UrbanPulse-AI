import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const weeklyTrends = [
    { day: 'MON', defects: 142, incidents: 12, avgDelay: 11 },
    { day: 'TUE', defects: 149, incidents: 8, avgDelay: 14 },
    { day: 'WED', defects: 153, incidents: 14, avgDelay: 16 },
    { day: 'THU', defects: 158, incidents: 11, avgDelay: 15 },
    { day: 'FRI', defects: 164, incidents: 19, avgDelay: 22 },
    { day: 'SAT', defects: 160, incidents: 7, avgDelay: 8 },
    { day: 'SUN', defects: 160, incidents: 6, avgDelay: 6 },
  ];

  const problemCorridors = [
    { corridor: 'Wakad-Hinjawadi Flyover Spine', defects: 28, delay: '+18m', incidents: 8, status: 'CRITICAL' },
    { corridor: 'Pune University Grade Separator', defects: 24, delay: '+15m', incidents: 6, status: 'HIGH' },
    { corridor: 'Karve Road Nal Stop Metro Line', defects: 19, delay: '+12m', incidents: 5, status: 'HIGH' },
    { corridor: 'Yerawada Chowk Nagar Road', defects: 17, delay: '+10m', incidents: 4, status: 'ELEVATED' },
    { corridor: 'Swargate Multimodal Junction', defects: 15, delay: '+9m', incidents: 7, status: 'ELEVATED' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-y-auto font-mono text-xs select-none">
      {/* Top Header Strip */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0">
        <span className="font-bold text-theme-primary">EXECUTIVE MUNICIPAL ANALYTICS & ARTERIAL DEGRADATION</span>
        <span className="text-[10px] text-graphite-400">REPORT CYCLE: 7-DAY AGGREGATION</span>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border-b border-graphite-700">
        <div className="bg-graphite-900 border border-graphite-700 p-2.5 rounded-sm">
          <span className="text-graphite-400 text-[10px] uppercase">Road Surface Integrity Index</span>
          <div className="text-lg font-bold text-amber-500 font-mono mt-0.5">68.4 / 100</div>
          <span className="text-[9px] text-graphite-500">-2.1% degradation this month</span>
        </div>
        <div className="bg-graphite-900 border border-graphite-700 p-2.5 rounded-sm">
          <span className="text-graphite-400 text-[10px] uppercase">Arterial Congestion Index</span>
          <div className="text-lg font-bold text-brand font-mono mt-0.5">1.42 Ratio</div>
          <span className="text-[9px] text-graphite-500">Peak delay: +18 mins</span>
        </div>
        <div className="bg-graphite-900 border border-graphite-700 p-2.5 rounded-sm">
          <span className="text-graphite-400 text-[10px] uppercase">Safety Incident Frequency</span>
          <div className="text-lg font-bold text-theme-primary font-mono mt-0.5">1.09 / 100km</div>
          <span className="text-[9px] text-graphite-500">35 alerts logged today</span>
        </div>
        <div className="bg-graphite-900 border border-graphite-700 p-2.5 rounded-sm">
          <span className="text-graphite-400 text-[10px] uppercase">Fleet Geographic Coverage</span>
          <div className="text-lg font-bold text-emerald-500 font-mono mt-0.5">74.8% Network</div>
          <span className="text-[9px] text-graphite-500">10 active transit corridors</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-b border-graphite-700">
        <div className="bg-graphite-900 border border-graphite-700 p-3 rounded-sm">
          <div className="text-[10px] text-graphite-400 font-bold uppercase mb-2">
            WEEKLY ASPHALT DEFECTS & CAVITY COUNT
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends}>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={9} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '10px' }} />
                <Bar dataKey="defects" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-graphite-900 border border-graphite-700 p-3 rounded-sm">
          <div className="text-[10px] text-graphite-400 font-bold uppercase mb-2">
            CONGESTION DELAY TREND BY DAY (MINUTES)
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={9} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '10px' }} />
                <Line type="monotone" dataKey="avgDelay" stroke="#DC2626" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom: Chronic Problem Corridors Ranking */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-[10px] font-bold text-graphite-400 uppercase mb-1">
          CHRONIC URBAN IMPEDANCE CORRIDORS (RANKED BY MAINTENANCE DEFICIT)
        </div>
        <div className="border border-graphite-700 bg-graphite-900 rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-graphite-950 text-graphite-400 text-[10px] uppercase border-b border-graphite-700">
              <tr>
                <th className="py-2 px-3">CORRIDOR NAME</th>
                <th className="py-2 px-3">ACTIVE DEFECTS</th>
                <th className="py-2 px-3">PEAK DELAY</th>
                <th className="py-2 px-3">SAFETY ALERTS</th>
                <th className="py-2 px-3 text-right">MUNICIPAL PRIORITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
              {problemCorridors.map((c, i) => (
                <tr key={i} className="hover:bg-graphite-850 transition">
                  <td className="py-2 px-3 font-semibold text-theme-primary">{c.corridor}</td>
                  <td className="py-2 px-3 text-amber-500 font-bold font-mono">{c.defects}</td>
                  <td className="py-2 px-3 text-brand font-bold font-mono">{c.delay}</td>
                  <td className="py-2 px-3 text-theme-secondary font-mono">{c.incidents}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-1.5 py-0 text-[9px] font-bold border rounded-none ${
                      c.status === 'CRITICAL' ? 'text-red-500 border-red-800/40 bg-red-500/10' : 'text-amber-500 border-amber-800/40 bg-amber-500/10'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
