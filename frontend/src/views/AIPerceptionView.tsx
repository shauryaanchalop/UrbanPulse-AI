import React, { useState, useEffect } from 'react';
import { ArrowRight, Cpu, Radio, Scan } from 'lucide-react';
import { api } from '../services/api';

export const AIPerceptionView: React.FC = () => {
  const [pipelineData, setPipelineData] = useState<any>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const data = await api.getInferencePipeline();
        setPipelineData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPipeline();
    const timer = setInterval(fetchPipeline, 2000);
    return () => clearInterval(timer);
  }, []);

  const pipelineStages = [
    { num: '01', title: 'VIDEO INGESTION', desc: '4x 1080p RTSP/MIPI feeds per bus' },
    { num: '02', title: 'FRAME DECODE', desc: 'Hardware NVDEC / TensorRT normalization' },
    { num: '03', title: 'OBJECT DETECTION', desc: 'YOLOv9-Edge INT8 (vehicles & pedestrians)' },
    { num: '04', title: 'SPATIAL TRACKING', desc: 'ByteTrack cross-frame track IDs' },
    { num: '05', title: 'DEFECT CLASSIFIER', desc: 'RoadDefectNet asphalt analysis' },
    { num: '06', title: 'EVENT ENGINE', desc: 'Proximity heuristics & lane swerve' },
    { num: '07', title: 'GNSS CORRELATION', desc: 'RTK GPS coordinate lock (±0.8m)' },
    { num: '08', title: 'METADATA STREAM', desc: 'MQTT 5.0 JSON packet (1.4 KB)' },
    { num: '09', title: 'ICCC AGGREGATION', desc: 'Multi-bus verification & triage' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-y-auto font-mono text-xs select-none">
      {/* Top Header */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand" />
          <span className="font-bold text-theme-primary">EDGE AI PERCEPTION PIPELINE & INFERENCE ABSTRACTION</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-graphite-400">
          <span>TARGET HARDWARE: <strong className="text-theme-primary">NVIDIA JETSON ORIN NANO</strong></span>
          <span>|</span>
          <span>QUANTIZATION: <strong className="text-emerald-500">INT8 TENSORRT</strong></span>
        </div>
      </div>

      {/* Pipeline 9-Stage Flow Diagram (Horizontal Terminal Strip) */}
      <div className="bg-graphite-950 border-b border-graphite-700 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-graphite-400 font-bold uppercase">
          <span>EDGE-TO-CLOUD DATAFLOW SCHEMATIC</span>
          <span className="text-emerald-500">ALL 9 PIPELINE STAGES SYNCHRONIZED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-9 gap-1 text-[10px]">
          {pipelineStages.map((st, i) => (
            <div key={i} className="p-2 bg-graphite-900 border border-graphite-700 flex flex-col justify-between rounded-sm">
              <div>
                <span className="text-brand font-bold block">{st.num}</span>
                <span className="text-theme-primary font-bold text-[10px] leading-tight block mt-0.5">{st.title}</span>
              </div>
              <span className="text-graphite-400 text-[9px] mt-2 block">{st.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Split: Frame Inspector (Left) and MQTT Metadata Payload (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 flex-1">
        {/* Left: Edge Visual Overlay Frame */}
        <div className="md:col-span-7 bg-graphite-900 border border-graphite-700 flex flex-col rounded-sm">
          <div className="h-8 px-3 border-b border-graphite-700 bg-graphite-950 flex items-center justify-between text-[10px] text-graphite-400">
            <span>EDGE OPTICAL INFERENCE OVERLAYS (BUS-004 FORWARD CAM)</span>
            <span>FPS: 29.8 | LATENCY: 16.2ms</span>
          </div>

          <div className="relative w-full h-80 bg-black overflow-hidden flex items-center justify-center">
            <img 
              src="/evidence/road_defect_1.jpg" 
              alt="Live Detection" 
              className="w-full h-full object-cover" 
            />

            {/* Computer Vision Bounding Overlays */}
            <div className="absolute top-[25%] left-[22%] w-[28%] h-[42%] border border-emerald-400 pointer-events-none">
              <span className="bg-emerald-500 text-black text-[9px] font-bold px-1 absolute -top-3.5 left-0">
                car 0.94
              </span>
            </div>

            <div className="absolute top-[54%] right-[22%] w-[24%] h-[32%] border border-amber-400 pointer-events-none">
              <span className="bg-amber-500 text-black text-[9px] font-bold px-1 absolute -top-3.5 left-0">
                pothole 0.92
              </span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 bg-black/85 px-2 py-1 text-[9px] border border-graphite-700 text-slate-300 flex justify-between">
              <span>MODEL: YOLOv9-Edge-INT8</span>
              <span>TRACKER: ByteTrack-v2</span>
              <span>ANPR: LPRNet-India</span>
            </div>
          </div>

          <div className="p-2 border-t border-graphite-700 grid grid-cols-4 gap-2 text-[10px] text-graphite-400">
            <div>OBJECTS: <b className="text-theme-primary">6 Tracked</b></div>
            <div>DEFECTS: <b className="text-amber-500">1 Cavity</b></div>
            <div>OCR CONF: <b className="text-emerald-500">97.4%</b></div>
            <div>PACKET: <b className="text-theme-primary font-mono">1.4 KB</b></div>
          </div>
        </div>

        {/* Right: Raw Structured JSON Metadata (MQTT Format) */}
        <div className="md:col-span-5 bg-graphite-900 border border-graphite-700 flex flex-col rounded-sm">
          <div className="h-8 px-3 border-b border-graphite-700 bg-graphite-950 flex items-center justify-between text-[10px] text-graphite-400">
            <span>EDGE-TRANSMITTED METADATA PACKET (MQTT 5.0)</span>
            <span className="text-emerald-500 font-bold">99.4% BANDWIDTH REDUCTION</span>
          </div>

          <div className="p-3 flex-1 bg-graphite-950 text-[10px] text-theme-secondary overflow-x-auto">
            <pre>{JSON.stringify({
  "event_id": "EVT-2026-0941",
  "source_bus": "BUS-004",
  "route_id": "RT-101",
  "timestamp": "2026-09-06T10:14:22.412Z",
  "telemetry": {
    "latitude": 18.598512,
    "longitude": 73.762145,
    "speed_kmh": 34.2,
    "heading_deg": 142.5,
    "rtk_accuracy_m": 0.4
  },
  "detections": [
    {
      "class": "pothole",
      "confidence": 0.942,
      "severity": "High",
      "bounding_box": [0.55, 0.62, 0.24, 0.32],
      "estimated_dim": "48cm x 35cm, 7.5cm depth"
    },
    {
      "class": "vehicle",
      "track_id": 108,
      "plate_number": "MH-12-RN-1004",
      "speed_est": 38.2
    }
  ],
  "edge_diagnostics": {
    "fps": 29.8,
    "gpu_load": "64%",
    "model_hash": "sha256:7f3a9e2"
  }
}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
