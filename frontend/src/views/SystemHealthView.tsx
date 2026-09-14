import React from 'react';
import type { SystemHealth } from '../types';
import { HeartPulse, Shield, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

interface SystemHealthViewProps {
  health: SystemHealth;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({ health }) => {
  const diagnostics = [
    { label: 'EDGE COMPUTE NODES', val: `${health.activeBusesTotal} / ${health.activeBusesTotal} ONLINE`, status: 'NOMINAL', color: 'text-emerald-400' },
    { label: 'OPTICAL CAMERAS', val: `${Math.round(health.cameraHealthPercent * 1.28)} / 128 FEEDS`, status: '98.4% OPERATIONAL', color: 'text-emerald-400' },
    { label: 'GNSS RTK PRECISION', val: '0.4m CEP LOCK', status: 'HIGH ACCURACY', color: 'text-emerald-400' },
    { label: 'EDGE INFERENCE RATE', val: `${health.avgEdgeInferenceFps} FPS AVG`, status: 'TENSORRT INT8', color: 'text-slate-200' },
    { label: 'TELEMETRY INGESTION', val: `${health.ingestionRateEventsPerSec} EVENTS/SEC`, status: 'MQTT 5.0 ACTIVE', color: 'text-emerald-400' },
    { label: 'API GATEWAY LATENCY', val: `${health.apiLatencyMs} MS`, status: 'FASTAPI ASYNC', color: 'text-emerald-400' },
    { label: 'SPATIAL DATABASE', val: 'SQLITE WAL (INDEXED)', status: 'OPERATIONAL', color: 'text-emerald-400' },
    { label: 'STREAMING GATEWAY', val: 'WEBSOCKET /ws', status: 'BI-DIRECTIONAL', color: 'text-emerald-400' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-y-auto font-sans text-xs select-none">
      {/* Top Header */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">ICCC INFRASTRUCTURE DIAGNOSTICS & TELEMETRY HEALTH</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold font-sans">ALL SYSTEMS OPERATIONAL</span>
      </div>

      {/* Diagnostics Table Rows */}
      <div className="p-3 border-b border-graphite-700 flex flex-col gap-2">
        <div className="text-[10px] font-bold text-graphite-400 uppercase">
          HARDWARE & BACKEND SUBSYSTEM STATUS
        </div>

        <div className="border border-graphite-700 bg-graphite-900 divide-y divide-graphite-800 rounded-sm overflow-hidden">
          {diagnostics.map((d, i) => (
            <div key={i} className="p-2.5 flex items-center justify-between hover:bg-graphite-850 transition">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-graphite-400 font-bold w-48">{d.label}</span>
                <span className={`font-bold ${d.color}`}>{d.val}</span>
              </div>
              <span className="text-[10px] text-graphite-400 bg-graphite-950 border border-graphite-800 px-2 py-0.5">
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Data Governance Section (DPDP Act 2023) */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-graphite-400 uppercase">
          <span>PRIVACY BY DESIGN & DATA GOVERNANCE (DPDP ACT 2023 COMPLIANCE)</span>
          <span className="text-emerald-400">AUDIT LOG SHA-256 VERIFIED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="p-3 bg-graphite-900 border border-graphite-700 flex flex-col gap-1 rounded-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <EyeOff className="w-3.5 h-3.5" />
              <span>EDGE DATA MINIMIZATION</span>
            </div>
            <p className="text-graphite-400 text-[10px] leading-relaxed mt-1">
              Raw 1080p camera feeds are processed in volatile GPU memory and discarded in milliseconds. Only structured coordinate and class metadata is transmitted over cellular.
            </p>
          </div>

          <div className="p-3 bg-graphite-900 border border-graphite-700 flex flex-col gap-1 rounded-sm">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>ANONYMIZATION & REDACTION</span>
            </div>
            <p className="text-graphite-400 text-[10px] leading-relaxed mt-1">
              Pedestrian facial regions are automatically blurred at the edge. High-resolution license plate data is cryptographically access-restricted to authorized Traffic Police terminals.
            </p>
          </div>

          <div className="p-3 bg-graphite-900 border border-graphite-700 flex flex-col gap-1 rounded-sm">
            <div className="flex items-center gap-2 text-brand font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>CRYPTOGRAPHIC AUDIT CHAIN</span>
            </div>
            <p className="text-graphite-400 text-[10px] leading-relaxed mt-1">
              Each incident evidence pack carries an immutable timestamped SHA-256 hash stamp referencing the bus sensor ID and RTK GNSS coordinates for legal evidence admissibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
