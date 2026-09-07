import React from 'react';
import { Network } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const competitorMatrix = [
    {
      feature: 'Sensing Platform',
      urbanPulse: 'Existing Municipal Transit Buses (Zero Dedicated Vehicle Fleets)',
      roadMetrics: 'Dedicated Smartphone In-Vehicle',
      haydenAI: 'Buses (Focused on Lane Enforcement)',
      nexar: 'Dashcams in Rideshare / Private Cars',
      vialytics: 'Municipal Maintenance Vans'
    },
    {
      feature: 'Domain Scope',
      urbanPulse: 'Unified: Road Surface + Traffic Density + Safety + ANPR',
      roadMetrics: 'Road Condition & Potholes Only',
      haydenAI: 'Transit Lane / Parking Enforcement',
      nexar: 'Traffic & Crash Telematics',
      vialytics: 'Pavement Management System'
    },
    {
      feature: 'Edge Processing & Bandwidth',
      urbanPulse: 'Edge-First (Metadata-Only 99.4% Compression via MQTT)',
      roadMetrics: 'Post-Trip Cloud Upload',
      haydenAI: 'Edge Ingestion for Evidence Clips',
      nexar: 'Cellular Video Snippet Upload',
      vialytics: 'Post-Drive Office Sync'
    },
    {
      feature: 'Multi-Bus Corroboration',
      urbanPulse: 'Spatial Multi-Bus Cross-Verification (Confidence Escalation)',
      roadMetrics: 'Single-Pass Verification',
      haydenAI: 'Single-Bus Violation Proof',
      nexar: 'Crowdsourced Anomaly Aggregation',
      vialytics: 'Single Survey Vehicle'
    },
    {
      feature: 'Smart City ICCC Integration',
      urbanPulse: 'Native Municipal Command Center REST & WebSocket APIs',
      roadMetrics: 'Stand-alone Web Portal',
      haydenAI: 'Transit Agency Enforcement Portal',
      nexar: 'Fleet Management API',
      vialytics: 'GIS Pavement Export (Shapefile / CSV)'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-y-auto font-mono text-xs select-none">
      {/* Top Header */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-brand" />
          <span className="font-bold text-theme-primary">SYSTEM ARCHITECTURE & COMPETITIVE POSITIONING</span>
        </div>
        <span className="text-[10px] text-graphite-400 font-mono">EDGE-TO-CLOUD SPECIFICATION</span>
      </div>

      {/* Architecture Flow Block Diagram */}
      <div className="p-3 border-b border-graphite-700 flex flex-col gap-2">
        <div className="text-[10px] font-bold text-graphite-400 uppercase">
          DATAFLOW PIPELINE: SENSOR INGESTION TO MUNICIPAL WORK ORDER
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[10px]">
          <div className="p-2.5 bg-graphite-900 border border-graphite-700 rounded-sm">
            <span className="text-brand font-bold block">01. PHYSICAL SENSORS</span>
            <span className="font-bold text-theme-primary text-xs block mt-0.5">Municipal Buses</span>
            <ul className="mt-2 text-graphite-400 space-y-1">
              <li>• 4x 1080p Optical Cameras</li>
              <li>• RTK GNSS / GPS (±0.8m)</li>
              <li>• 6-DOF Inertial Unit (IMU)</li>
            </ul>
          </div>

          <div className="p-2.5 bg-graphite-900 border border-graphite-700 rounded-sm">
            <span className="text-brand font-bold block">02. EDGE COMPUTE</span>
            <span className="font-bold text-theme-primary text-xs block mt-0.5">NVIDIA Jetson / Orin</span>
            <ul className="mt-2 text-graphite-400 space-y-1">
              <li>• DeepStream / NVDEC</li>
              <li>• YOLOv9 INT8 Quantized</li>
              <li>• ByteTrack Multi-Entity ID</li>
            </ul>
          </div>

          <div className="p-2.5 bg-graphite-900 border border-graphite-700 rounded-sm">
            <span className="text-brand font-bold block">03. EVENT HEURISTICS</span>
            <span className="font-bold text-theme-primary text-xs block mt-0.5">Edge Heuristics</span>
            <ul className="mt-2 text-graphite-400 space-y-1">
              <li>• Asphalt Defect Classifier</li>
              <li>• Pedestrian Blind-Spot Risk</li>
              <li>• JSON Metadata (1.4 KB)</li>
            </ul>
          </div>

          <div className="p-2.5 bg-graphite-900 border border-graphite-700 rounded-sm">
            <span className="text-brand font-bold block">04. CENTRAL INGESTION</span>
            <span className="font-bold text-theme-primary text-xs block mt-0.5">FastAPI & EventBus</span>
            <ul className="mt-2 text-graphite-400 space-y-1">
              <li>• MQTT 5.0 / WebSocket Hub</li>
              <li>• Spatial Cross-Verifier</li>
              <li>• SQLite WAL & Indexes</li>
            </ul>
          </div>

          <div className="p-2.5 bg-graphite-900 border border-graphite-700 rounded-sm">
            <span className="text-brand font-bold block">05. MUNICIPAL TRIAGE</span>
            <span className="font-bold text-theme-primary text-xs block mt-0.5">ICCC Action Engine</span>
            <ul className="mt-2 text-graphite-400 space-y-1">
              <li>• Automated P1-P4 Work Orders</li>
              <li>• Contractor SLA Routing</li>
              <li>• Traffic Police CAD Dispatch</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Competitor Positioning Matrix */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[10px] font-bold text-graphite-400 uppercase mb-1">
          COMPETITIVE ARCHITECTURE COMPARISON MATRIX
        </div>
        <div className="border border-graphite-700 bg-graphite-900 overflow-x-auto rounded-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-graphite-950 text-graphite-400 text-[10px] uppercase border-b border-graphite-700">
              <tr>
                <th className="py-2 px-3">EVALUATION VECTOR</th>
                <th className="py-2 px-3 text-brand bg-brand/5 border-l border-r border-brand/30 font-bold">
                  URBANPULSE AI (PROPOSED)
                </th>
                <th className="py-2 px-3">ROADMETRICS</th>
                <th className="py-2 px-3">HAYDEN AI</th>
                <th className="py-2 px-3">NEXAR</th>
                <th className="py-2 px-3">VIALYTICS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
              {competitorMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-graphite-850 transition">
                  <td className="py-2 px-3 font-semibold text-theme-primary">{row.feature}</td>
                  <td className="py-2 px-3 text-theme-primary bg-brand/5 border-l border-r border-brand/30 font-bold">
                    {row.urbanPulse}
                  </td>
                  <td className="py-2 px-3 text-graphite-400">{row.roadMetrics}</td>
                  <td className="py-2 px-3 text-graphite-400">{row.haydenAI}</td>
                  <td className="py-2 px-3 text-graphite-400">{row.nexar}</td>
                  <td className="py-2 px-3 text-graphite-400">{row.vialytics}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
