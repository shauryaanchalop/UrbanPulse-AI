import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Video, Play, StopCircle, RefreshCw, ShieldAlert, 
  Cpu, Eye, CheckCircle2, AlertTriangle, Layers, Upload, 
  Sun, CloudFog, AlertCircle, FileText, Check, Shield
} from 'lucide-react';
import { api } from '../services/api';

export const LiveVisionView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inferenceFps, setInferenceFps] = useState(29.4);
  const [lastInferenceTimeMs, setLastInferenceTimeMs] = useState(12.4);

  // Vision Modes & Media State
  const [activeSource, setActiveSource] = useState<'WEBCAM' | 'UPLOAD' | 'SAMPLE'>('WEBCAM');
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<'image' | 'video' | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>('POTHOLE');

  // Fog & Visibility Mode State
  const [fogMode, setFogMode] = useState<'CLEAR' | 'LIGHT_FOG' | 'DENSE_FOG'>('CLEAR');

  // Active Detections & ANPR Results
  const [detections, setDetections] = useState<Array<{ x: number; y: number; w: number; h: number; label: string; confidence: number; trackId: number }>>([
    { x: 0.2, y: 0.3, w: 0.35, h: 0.4, label: 'pothole (severe)', confidence: 0.94, trackId: 501 },
    { x: 0.6, y: 0.45, w: 0.2, h: 0.35, label: 'car', confidence: 0.91, trackId: 502 },
    { x: 0.15, y: 0.25, w: 0.25, h: 0.5, label: 'person', confidence: 0.88, trackId: 503 }
  ]);

  const [anprResult, setAnprResult] = useState<{ rawText: string; normalizedText: string; confidence: number; isWatchlistMatch: boolean; timestamp: string } | null>({
    rawText: 'MH-12-AB-1234',
    normalizedText: 'MH12AB1234',
    confidence: 0.96,
    isWatchlistMatch: true,
    timestamp: new Date().toLocaleTimeString()
  });

  // Sample Media Library Items
  const sampleMediaItems = [
    {
      id: 'POTHOLE',
      label: 'Pothole & Surface Defect',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
      detections: [
        { x: 0.25, y: 0.4, w: 0.45, h: 0.35, label: 'pothole (critical)', confidence: 0.96, trackId: 101 },
        { x: 0.05, y: 0.2, w: 0.3, h: 0.4, label: 'alligator cracking', confidence: 0.89, trackId: 102 }
      ]
    },
    {
      id: 'CLEAR_ROAD',
      label: 'Clear Arterial Road',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      detections: [
        { x: 0.3, y: 0.35, w: 0.25, h: 0.3, label: 'bus', confidence: 0.95, trackId: 201 },
        { x: 0.6, y: 0.4, w: 0.18, h: 0.25, label: 'car', confidence: 0.92, trackId: 202 }
      ]
    },
    {
      id: 'FOG',
      label: 'Winter Fog / Low Visibility',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=800&q=80',
      detections: [
        { x: 0.35, y: 0.45, w: 0.3, h: 0.3, label: 'pothole (dehazed)', confidence: 0.78, trackId: 301 }
      ]
    },
    {
      id: 'PLATE',
      label: 'ANPR License Plate OCR',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      detections: [
        { x: 0.4, y: 0.6, w: 0.2, h: 0.15, label: 'license_plate', confidence: 0.98, trackId: 401 }
      ]
    }
  ];

  // Start Browser Webcam
  const handleStartCamera = async () => {
    setCameraError(null);
    setActiveSource('WEBCAM');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('[Webcam Access]', err);
      setCameraError('Webcam access unavailable or permission denied. Switch to Sample Media or File Upload below.');
      setIsCameraActive(false);
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

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleStopCamera();
    setActiveSource('UPLOAD');
    const url = URL.createObjectURL(file);
    setUploadedMediaUrl(url);
    setUploadedMediaType(file.type.startsWith('video') ? 'video' : 'image');

    // Run simulated AI inference on uploaded media
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setDetections([
        { x: 0.25, y: 0.35, w: 0.3, h: 0.4, label: 'uploaded_object (pothole)', confidence: 0.93, trackId: 801 },
        { x: 0.6, y: 0.5, w: 0.25, h: 0.3, label: 'vehicle', confidence: 0.90, trackId: 802 }
      ]);
    }, 800);
  };

  // Select Sample Media Item
  const handleSelectSampleMedia = (item: typeof sampleMediaItems[0]) => {
    handleStopCamera();
    setActiveSource('SAMPLE');
    setSelectedSample(item.id);
    setUploadedMediaUrl(item.url);
    setUploadedMediaType('image');
    setDetections(item.detections);
  };

  // Fog visibility adjustments
  const getVisibilityScore = () => {
    if (fogMode === 'CLEAR') return { score: '94% (EXCELLENT)', Dehaze: 'OFF', confFactor: 1.0 };
    if (fogMode === 'LIGHT_FOG') return { score: '62% (MODERATE FOG)', Dehaze: 'CLAHE ENABLED', confFactor: 0.85 };
    return { score: '28% (DENSE FOG)', Dehaze: 'TEMPORAL DEHAZING ACTIVE', confFactor: 0.70 };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-theme-bg overflow-y-auto font-mono text-xs select-none p-4 space-y-4 transition-colors">
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap justify-between items-center bg-theme-surface border border-theme-border p-3 rounded-sm gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand/10 border border-brand/40 text-brand rounded-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-theme-primary">VISION AI SANDBOX — MULTI-MODAL CAMERA INFERENCE</h2>
            <p className="text-[10px] text-theme-secondary font-sans">
              Test webcam capture, image/video uploads, sample media library & Fog/Winter low-visibility dehazing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Source Tabs */}
          <div className="flex border border-theme-border rounded-sm overflow-hidden text-[11px] font-bold">
            <button
              onClick={handleStartCamera}
              className={`px-3 py-1.5 flex items-center space-x-1 ${
                activeSource === 'WEBCAM' && isCameraActive ? 'bg-emerald-600 text-white' : 'bg-theme-panel text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>LIVE WEBCAM</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-1.5 flex items-center space-x-1 ${
                activeSource === 'UPLOAD' ? 'bg-brand text-white' : 'bg-theme-panel text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>UPLOAD FILE</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => handleSelectSampleMedia(sampleMediaItems[0])}
              className={`px-3 py-1.5 flex items-center space-x-1 ${
                activeSource === 'SAMPLE' ? 'bg-amber-600 text-white' : 'bg-theme-panel text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SAMPLE LIBRARY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Warning Banner */}
      {cameraError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-sm flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left 2 Cols: Main Media Viewport */}
        <div className="lg:col-span-2 bg-black border border-theme-border rounded-sm relative flex flex-col justify-between overflow-hidden min-h-[400px]">
          {/* Status Overlay Ribbon */}
          <div className="absolute top-2 left-2 z-20 flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              ● SOURCE: {activeSource} {isAnalyzing && '(ANALYZING...)'}
            </span>

            <span className="px-2 py-0.5 text-[9px] font-bold bg-black/80 text-white border border-theme-border">
              {inferenceFps} FPS | {lastInferenceTimeMs}ms
            </span>

            {/* Fog Overlay Badge */}
            <span className={`px-2 py-0.5 text-[9px] font-bold border ${
              fogMode === 'CLEAR' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              VISIBILITY: {getVisibilityScore().score}
            </span>
          </div>

          {/* Media Viewport Container */}
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
            {/* Webcam Video Element */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${activeSource !== 'WEBCAM' || !isCameraActive ? 'hidden' : ''}`}
              muted
              playsInline
            />

            {/* Uploaded or Sample Image/Video Element */}
            {activeSource !== 'WEBCAM' && uploadedMediaUrl && (
              uploadedMediaType === 'video' ? (
                <video src={uploadedMediaUrl} controls autoPlay loop className="w-full h-full object-contain" />
              ) : (
                <img src={uploadedMediaUrl} alt="Vision AI input" className="w-full h-full object-contain" />
              )
            )}

            {/* Placeholder when idle */}
            {activeSource === 'WEBCAM' && !isCameraActive && (
              <div className="text-center p-8 space-y-3">
                <Video className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                <div className="text-slate-300 font-bold">WEBCAM STANDBY</div>
                <button
                  onClick={handleStartCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm shadow-md"
                >
                  START BROWSER WEBCAM
                </button>
              </div>
            )}

            {/* Simulated Fog / Low-Visibility Overlay filter */}
            {fogMode !== 'CLEAR' && (
              <div className={`absolute inset-0 pointer-events-none transition-all ${
                fogMode === 'LIGHT_FOG' ? 'bg-slate-200/20 backdrop-blur-[1px]' : 'bg-slate-200/40 backdrop-blur-[2.5px]'
              }`}></div>
            )}

            {/* Bounding Box Overlays */}
            {(isCameraActive || activeSource !== 'WEBCAM') && (
              <div className="absolute inset-0 pointer-events-none">
                {detections.map((det, idx) => {
                  const adjustedConf = det.confidence * getVisibilityScore().confFactor;
                  const isPothole = det.label.toLowerCase().includes('pothole');
                  const borderColor = isPothole ? 'border-brand bg-brand/10' : 'border-emerald-400 bg-emerald-400/10';
                  const textColor = isPothole ? 'bg-brand text-white' : 'bg-emerald-400 text-black';

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
                        {det.label.toUpperCase()} [{(adjustedConf * 100).toFixed(0)}%] #{det.trackId}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-2 bg-theme-panel border-t border-theme-border text-[10px] flex justify-between items-center text-theme-secondary font-mono">
            <span>MODEL: YOLOv9-Edge-INT8 + LPRNet ANPR</span>
            <span>DEHAZE PIPELINE: {getVisibilityScore().Dehaze}</span>
          </div>
        </div>

        {/* Right 1 Col: Controls, ANPR & Watchlist Panel */}
        <div className="space-y-4">
          {/* Fog Mode Selector */}
          <div className="bg-theme-surface border border-theme-border p-3 rounded-sm space-y-2">
            <div className="font-bold text-theme-primary uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CloudFog className="w-4 h-4 text-amber-500" />
                FOG / LOW-VISIBILITY PIPELINE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
              {(['CLEAR', 'LIGHT_FOG', 'DENSE_FOG'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFogMode(f)}
                  className={`py-1.5 border rounded-sm ${
                    fogMode === f ? 'bg-brand text-white border-brand' : 'bg-theme-panel text-theme-secondary border-theme-border'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Media Library Picker */}
          <div className="bg-theme-surface border border-theme-border p-3 rounded-sm space-y-2">
            <div className="font-bold text-theme-primary uppercase text-xs">SAMPLE MEDIA LIBRARY</div>
            <div className="space-y-1">
              {sampleMediaItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSampleMedia(item)}
                  className={`w-full p-2 border rounded-sm text-left flex items-center justify-between text-[11px] font-mono transition-all ${
                    activeSource === 'SAMPLE' && selectedSample === item.id 
                      ? 'border-brand bg-brand/10 text-brand font-bold' 
                      : 'border-theme-border bg-theme-panel text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-theme-muted">RUN →</span>
                </button>
              ))}
            </div>
          </div>

          {/* ANPR Watchlist Alert Box */}
          <div className="bg-theme-surface border border-theme-border p-3 rounded-sm space-y-3">
            <div className="flex justify-between items-center border-b border-theme-border pb-2">
              <span className="font-bold text-theme-primary uppercase">ANPR OCR & WATCHLIST</span>
              <span className="text-[10px] text-emerald-500 font-bold">LPRNet ACTIVE</span>
            </div>

            {anprResult && (
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-sm text-center space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">OCR PLATE READ</div>
                  <div className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                    {anprResult.normalizedText}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    CONFIDENCE: <strong>{(anprResult.confidence * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                {/* Important Legal/Safety Banner */}
                {anprResult.isWatchlistMatch && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-sm font-mono text-[10px] space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>POTENTIAL VEHICLE-OF-INTEREST MATCH</span>
                    </div>
                    <div className="text-slate-300">
                      Human verification required. No automatic enforcement executed.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
