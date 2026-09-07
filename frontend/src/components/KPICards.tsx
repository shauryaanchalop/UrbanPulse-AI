import React from 'react';
import { OverviewKPIs } from '../types';
import { Bus, AlertTriangle, ShieldAlert, TrendingDown, Wrench, Navigation } from 'lucide-react';

interface KPICardsProps {
  kpis: OverviewKPIs;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Active Buses',
      value: `${kpis.activeBuses} / 32`,
      change: '+100% In Service',
      trend: 'positive',
      icon: Bus,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-600/30',
      detail: 'Continuous mobile sensing'
    },
    {
      title: 'Road Defects',
      value: kpis.totalRoadIssues,
      change: `${kpis.multiBusVerifiedCount} Cross-verified`,
      trend: 'neutral',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-950/30',
      border: 'border-amber-600/30',
      detail: 'Potholes, markings & signage'
    },
    {
      title: 'Critical Safety',
      value: kpis.criticalIncidents,
      change: `${kpis.safetyAlertsToday} alerts today`,
      trend: 'warning',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-950/30',
      border: 'border-rose-600/30',
      detail: 'Rash driving & pedestrian risks'
    },
    {
      title: 'Congestion Zones',
      value: kpis.congestionHotspots,
      change: 'Avg speed 24.2 km/h',
      trend: 'neutral',
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-950/30',
      border: 'border-red-600/30',
      detail: 'Corridor choke points'
    },
    {
      title: 'Open Tickets',
      value: kpis.openMaintenanceTickets,
      change: 'Avg SLA 48h',
      trend: 'positive',
      icon: Wrench,
      color: 'text-sky-400',
      bg: 'bg-sky-950/30',
      border: 'border-sky-600/30',
      detail: 'Municipal work orders'
    },
    {
      title: 'City Coverage',
      value: `${kpis.roadCoveragePercent}%`,
      change: '10 Transit Corridors',
      trend: 'positive',
      icon: Navigation,
      color: 'text-purple-400',
      bg: 'bg-purple-950/30',
      border: 'border-purple-600/30',
      detail: 'Arterial network scanned'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3 rounded-xl bg-iccc-900/90 backdrop-blur-md border ${c.border} flex flex-col justify-between shadow-lg transition-all hover:border-slate-500`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{c.title}</span>
              <div className={`p-1.5 rounded-lg ${c.bg} ${c.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1.5">
              <div className="text-xl font-bold font-mono tracking-tight text-white">
                {c.value}
              </div>
              <div className="text-[10px] text-sky-400 font-medium mt-0.5">
                {c.change}
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
              <span>{c.detail}</span>
              <span className="font-mono text-slate-600">[Sim]</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
