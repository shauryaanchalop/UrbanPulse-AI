import React from 'react';
import type { OverviewKPIs } from '../types';

interface KPITelemetryStripProps {
  kpis: OverviewKPIs;
  onFilterCritical?: () => void;
  onFilterVerified?: () => void;
}

export const KPITelemetryStrip: React.FC<KPITelemetryStripProps> = ({ 
  kpis,
  onFilterCritical,
  onFilterVerified
}) => {
  return (
    <div className="bg-theme-surface border-b border-theme-border px-3 py-1.5 flex items-center justify-between overflow-x-auto text-xs shrink-0 select-none font-mono">
      <div className="flex items-center divide-x divide-theme-border">
        {/* FLEET */}
        <div className="px-3 first:pl-0 flex items-baseline gap-2">
          <span className="text-[10px] text-theme-muted uppercase tracking-wider">
            FLEET:
          </span>
          <span className="font-bold text-xs text-emerald-500">
            {kpis.activeBuses} ACTIVE
          </span>
        </div>

        {/* EVENTS */}
        <div className="px-3 flex items-baseline gap-2">
          <span className="text-[10px] text-theme-muted uppercase tracking-wider">
            EVENTS:
          </span>
          <span className="font-bold text-xs text-theme-primary">
            {kpis.totalRoadIssues} TODAY
          </span>
        </div>

        {/* CRITICAL */}
        <div 
          onClick={onFilterCritical}
          className={`px-3 flex items-baseline gap-2 ${onFilterCritical ? 'cursor-pointer hover:bg-theme-elevated rounded-sm' : ''}`}
          title="Filter critical priority incidents"
        >
          <span className="text-[10px] text-theme-muted uppercase tracking-wider">
            CRITICAL:
          </span>
          <span className="font-bold text-xs text-brand">
            {kpis.criticalIncidents.toString().padStart(2, '0')}
          </span>
        </div>

        {/* VERIFIED */}
        <div 
          onClick={onFilterVerified}
          className={`px-3 flex items-baseline gap-2 ${onFilterVerified ? 'cursor-pointer hover:bg-theme-elevated rounded-sm' : ''}`}
          title="Filter cross-verified defects"
        >
          <span className="text-[10px] text-theme-muted uppercase tracking-wider">
            VERIFIED:
          </span>
          <span className="font-bold text-xs text-emerald-500">
            {kpis.multiBusVerifiedCount}
          </span>
        </div>

        {/* COVERAGE */}
        <div className="px-3 flex items-baseline gap-2 hidden sm:flex">
          <span className="text-[10px] text-theme-muted uppercase tracking-wider">
            COVERAGE:
          </span>
          <span className="font-bold text-xs text-theme-secondary">
            {kpis.roadCoveragePercent}%
          </span>
        </div>

        {/* SYSTEM */}
        <div className="px-3 flex items-baseline gap-2">
          <span className="text-[10px] text-theme-muted uppercase tracking-wider">
            SYSTEM:
          </span>
          <span className="font-bold text-xs text-emerald-500">
            99.8%
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 pl-4 text-[10px] text-theme-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>MUNICIPAL SENSING CLUSTER NOMINAL</span>
      </div>
    </div>
  );
};
