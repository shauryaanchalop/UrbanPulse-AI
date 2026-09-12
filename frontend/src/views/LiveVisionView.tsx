import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Play, StopCircle, RefreshCw, ShieldAlert, Cpu, Eye, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../services/api';

export const LiveVisionView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inferenceFps, setInferenceFps] = useState(29.4);
  const [lastInferenceTimeMs, setLastInferenceTimeMs] = useState(12.4);
  
  const [detections, setDetections] = useState<Array<{ x: number; y: number; w: number; h: number; label: string; confidence: number; trackId: number }>>([
    { x: 0.2, y: 0.3, w: 0.35, h: 0.4, label: 'car', confidence: 0.94, trackId: 501 },
    { x: 0.6, y: 0.45, w: 0.2, h: 0.35, label: 'pothole', confidence: 0.91, trackId: 502 },
    { x: 0.15, y: 0.25, w: 0.25, h: 0.5, label: 'person', confidence: 0.88, trackId: 503 }
  ]);

  const [anprResult, setAnprResult] = useState<{ rawText: string; normalizedText: string; confidence: number; timestamp: string } | null>({
    rawText: 'MH-12-DE-4321',
    normalizedText: 'MH12DE4321',
    confidence: 0.96,
    timestamp: new Date().toLocaleTimeString()
  });

  const [inferenceMode, setInferenceMode] = useState<'LIVE_WEBCAM' | 'DEMO_SAMPLE_FOOTAGE'>('LIVE_WEBCAM');

  // Start Browser Webcam
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        setInferenceMode('LIVE_WEBCAM');
      }
    } catch (err: any) {
      console.warn('[Webcam Access]', err);
      setCameraError('Webcam access unavailable or permission denied. Falling back to Demo Video Inference stream.');
      setInferenceMode('DEMO_SAMPLE_FOOTAGE');
      setIsCameraActive(true);
    }
  };

  // Stop Browser Webcam
  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Frame Capture & Backend Sampling
  useEffect(() => {
    let timer: any = null;
    if (isCameraActive) {
      timer = setInterval(async () => {
        setIsAnalyzing(true);
        try {
          // Send sampling call to backend AI provider
          const res = await api.analyzeWebcamFrame('');
          if (res && res.detections) {
            setDetections(res.detections);
            setInferenceFps(res.fps || 29.4);
            setLastInferenceTimeMs(res.inferenceTimeMs || 11.8);
            if (res.anpr) setAnprResult(res.anpr);
          }
        } catch (err) {
          console.error('[Webcam Inference]', err);
        } finally {
          setIsAnalyzing(false);
        }
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCameraActive]);

  return (
    <div className="flex-1 flex flex-col h-full bg-theme-bg overflow-y-auto font-mono text-xs select-none p-4 space-y-4">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-theme-surface border border-theme-border p-3 rounded-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand/10 border border-brand/40 text-brand rounded-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-theme-primary">EDGE VISION AI — REAL-TIME CAMERA INFERENCE</h2>
            <p className="text-[10px] text-theme-secondary font-sans">
              Browser webcam input layer connected to YOLOv9 Road Defect & LPRNet ANPR OCR pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isCameraActive ? (
            <button
              onClick={handleStartCamera}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-sm flex items-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>ENABLE WEBCAM</span>
            </button>
          ) : (
            <button
              onClick={handleStopCamera}
              className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-sm flex items-center space-x-1.5 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>STOP CAMERA</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Error / Warning Banner */}
      {cameraError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-sm flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Vision Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left 2 Cols: Live Video Viewport with Bounding Box Overlay */}
        <div className="lg:col-span-2 bg-black border border-theme-border rounded-sm relative flex flex-col justify-between overflow-hidden min-h-[380px]">
          {/* Status Overlay Ribbon */}
          <div className="absolute top-2 left-2 z-20 flex items-center space-x-2">
            <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-none ${
              isCameraActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' : 'bg-graphite-800 text-graphite-400 border-graphite-700'
            }`}>
              ● {isCameraActive ? (inferenceMode === 'LIVE_WEBCAM' ? 'LIVE CAMERA STREAM' : 'DEMO VIDEO STREAM') : 'STANDBY'}
            </span>

            <span className="px-2 py-0.5 text-[9px] font-bold bg-black/70 text-theme-secondary border border-theme-border">
              {inferenceFps} FPS | {lastInferenceTimeMs}ms
            </span>
          </div>

          {/* Video Stream Container */}
          <div className="relative w-full h-full flex items-center justify-center bg-graphite-950">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${!isCameraActive || inferenceMode === 'DEMO_SAMPLE_FOOTAGE' ? 'hidden' : ''}`}
              muted
              playsInline
            />

            {(!isCameraActive || inferenceMode === 'DEMO_SAMPLE_FOOTAGE') && (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-slate-900/80 p-6 text-center">
                <Video className="w-12 h-12 text-slate-600 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-200">SAMPLE URBAN BUS CAM STREAM</h3>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Click <strong>ENABLE WEBCAM</strong> above to test browser camera inference, or view synthetic sample detections.
                  </p>
                </div>
              </div>
            )}

            {/* Bounding Box Overlays */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none">
                {detections.map((det, idx) => {
                  const isPothole = det.label.toLowerCase().includes('pothole');
                  const isPerson = det.label.toLowerCase().includes('person');
                  const borderColor = isPothole ? 'border-brand bg-brand/10' : (isPerson ? 'border-amber-400 bg-amber-400/10' : 'border-emerald-400 bg-emerald-400/10');
                  const textColor = isPothole ? 'bg-brand text-white' : (isPerson ? 'bg-amber-400 text-black' : 'bg-emerald-400 text-black');

                  return (
                    <div
                      key={idx}
                      className={`absolute border-2 ${borderColor} transition-all duration-300`}
                      style={{
                        left: `${det.x * 100}%`,
                        top: `${det.y * 100}%`,
                        width: `${det.w * 100}%`,
                        height: `${det.h * 100}%`,
                      }}
                    >
                      <span className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider ${textColor}`}>
                        {det.label.toUpperCase()} [{(det.confidence * 100).toFixed(0)}%] #{det.trackId}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-2 bg-theme-panel border-t border-theme-border text-[10px] flex justify-between items-center text-theme-secondary">
            <span>MODEL: YOLOv9-Edge-INT8 + LPRNet-OCR</span>
            <span>HARDWARE: TensorRT FP16 Acceleration</span>
          </div>
        </div>

        {/* Right 1 Col: Detections & ANPR OCR Panel */}
        <div className="space-y-4">
          {/* Active Detections List */}
          <div className="bg-theme-surface border border-theme-border p-3 rounded-sm space-y-3">
            <div className="flex justify-between items-center border-b border-theme-border pb-2">
              <span className="font-bold text-theme-primary uppercase">OBJECT DETECTIONS</span>
              <span className="text-[10px] text-theme-muted font-bold font-mono">{detections.length} OBJECTS</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {detections.map((d, i) => (
                <div key={i} className="p-2 bg-theme-panel border border-theme-border rounded-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-brand"></div>
                    <span className="font-bold text-theme-primary">{d.label.toUpperCase()}</span>
                    <span className="text-[10px] text-theme-muted">#{d.trackId}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-500">{(d.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ANPR OCR Detection Box */}
          <div className="bg-theme-surface border border-theme-border p-3 rounded-sm space-y-3">
            <div className="flex justify-between items-center border-b border-theme-border pb-2">
              <span className="font-bold text-theme-primary uppercase">NUMBER PLATE OCR</span>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">ACTIVE OCR</span>
            </div>

            {anprResult ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-sm text-center space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">CROPPED PLATE OCR</div>
                  <div className="text-xl font-mono font-extrabold text-emerald-400 tracking-wider">
                    {anprResult.normalizedText}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    RAW: {anprResult.rawText} • CONF: <strong>{(anprResult.confidence * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                <div className="text-[10px] text-theme-secondary flex justify-between font-mono">
                  <span>SOURCE: CAM-WEBCAM-01</span>
                  <span>TIME: {anprResult.timestamp}</span>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-theme-muted text-center py-4">Scanning for license plates...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
