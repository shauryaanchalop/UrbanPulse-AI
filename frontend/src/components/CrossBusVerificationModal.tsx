import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, X, AlertTriangle, Eye, Layers } from 'lucide-react';

interface CrossBusVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCommand?: () => void;
}

export const CrossBusVerificationModal: React.FC<CrossBusVerificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCommand
}) => {
  const [activeStep, setActiveStep] = useState<number>(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-sans">
      <div className="bg-theme-surface border border-theme-border w-full max-w-4xl shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-11 bg-theme-panel border-b border-theme-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-brand"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              ALGORITHMIC SPOTLIGHT: MULTI-BUS DEFECT CORROBORATION
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-theme-elevated text-theme-secondary border border-theme-border rounded-sm">
              PATENTABLE CONSENSUS LOGIC
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-theme-muted hover:text-theme-primary p-1 rounded-sm hover:bg-theme-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Executive Overview Banner */}
          <div className="bg-theme-panel border border-theme-border p-4 flex items-start gap-4 rounded-sm">
            <div className="p-2 bg-brand/10 border border-brand/30 text-brand rounded-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-theme-primary">
                Eliminating Civic False Positives Through Spatio-Temporal Corroboration
              </h3>
              <p className="text-xs text-theme-secondary mt-1 leading-relaxed font-sans">
                Single-camera detections can be tricked by surface shadows, fallen leaves, or temporary road debris. 
                UrbanPulse AI enforces a mathematical spatial consensus rule: an incident is only elevated to high-priority work order status when two independent buses cross-verify the anomaly within ±25 meters and 120 minutes.
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-3 gap-2 border-b border-theme-border pb-3">
            <button
              onClick={() => setActiveStep(0)}
              className={`text-left p-2.5 border transition-all rounded-sm ${
                activeStep === 0 
                  ? 'border-brand bg-brand/5 text-theme-primary font-bold' 
                  : 'border-theme-border bg-theme-panel text-theme-muted hover:text-theme-primary'
              }`}
            >
              <div className="text-[10px] text-brand">PASS 01 • 10:14:02</div>
              <div className="text-xs font-semibold mt-0.5">BUS-004 Initial Sighting</div>
              <div className="text-[11px] text-theme-muted mt-0.5">Confidence: 84% (Unverified)</div>
            </button>

            <button
              onClick={() => setActiveStep(1)}
              className={`text-left p-2.5 border transition-all rounded-sm ${
                activeStep === 1 
                  ? 'border-brand bg-brand/5 text-theme-primary font-bold' 
                  : 'border-theme-border bg-theme-panel text-theme-muted hover:text-theme-primary'
              }`}
            >
              <div className="text-[10px] text-amber-500">PASS 02 • 10:18:45</div>
              <div className="text-xs font-semibold mt-0.5">BUS-012 Spatial Convergence</div>
              <div className="text-[11px] text-theme-muted mt-0.5">Distance Delta: 8.4 meters</div>
            </button>

            <button
              onClick={() => setActiveStep(2)}
              className={`text-left p-2.5 border transition-all rounded-sm ${
                activeStep === 2 
                  ? 'border-emerald-500 bg-emerald-500/10 text-theme-primary font-bold' 
                  : 'border-theme-border bg-theme-panel text-theme-muted hover:text-theme-primary'
              }`}
            >
              <div className="text-[10px] text-emerald-500">DECISION ESCALATION</div>
              <div className="text-xs font-semibold mt-0.5">Confidence Reaches 98%</div>
              <div className="text-[11px] text-theme-muted mt-0.5">Auto-Dispatch P1 Work Order</div>
            </button>
          </div>

          {/* Dynamic Step Detail Visualizer */}
          <div className="bg-theme-panel border border-theme-border p-5 rounded-sm">
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-theme-primary font-bold">INCIDENT ID: DEF-0012 (POTHOLE SEVERE)</span>
                  <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
                    STATUS: PENDING CORROBORATION
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-theme-surface border border-theme-border p-3 rounded-sm">
                    <div className="text-[11px] text-theme-muted mb-2 font-bold">EDGE SENSOR TELEMETRY</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-theme-border">
                        <span className="text-theme-muted">Observing Node:</span>
                        <span className="text-theme-primary font-bold">BUS-004 (Route 102)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-theme-border">
                        <span className="text-theme-muted">GPS Coordinates:</span>
                        <span className="text-theme-primary">18.5292°N, 73.8441°E</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-theme-border">
                        <span className="text-theme-muted">IMU Vertical Spike:</span>
                        <span className="text-brand font-bold">+1.84g Z-axis</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-theme-muted">Inference Engine:</span>
                        <span className="text-theme-primary">TensorRT YOLOv8 (28.4 FPS)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-theme-surface border border-theme-border p-3 flex flex-col justify-between rounded-sm">
                    <div>
                      <div className="text-[11px] text-theme-muted mb-1 font-bold">MUNICIPAL POLICY ENFORCEMENT</div>
                      <p className="text-xs text-theme-secondary leading-relaxed mt-2 font-sans">
                        Because confidence is below the 95% automated dispatch threshold, the system flags the geo-zone for secondary fleet monitoring rather than triggering a municipal dispatch team.
                      </p>
                    </div>
                    <div className="p-2 bg-theme-panel border border-theme-border flex items-center gap-2 mt-4 rounded-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">
                        Awaiting corroborating pass from nearby Route 105 buses.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-theme-primary font-bold">SPATIO-TEMPORAL CLUSTERING ENGINE</span>
                  <span className="text-xs text-brand bg-brand/10 border border-brand/40 px-2 py-0.5">
                    MATCH CONFIRMED (DELTA: 8.4m)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-theme-surface border border-theme-border p-3 rounded-sm">
                    <div className="text-[11px] text-theme-muted mb-2 font-bold">BUS-012 INTERCEPT DATA</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-theme-border">
                        <span className="text-theme-muted">Second Bus Node:</span>
                        <span className="text-theme-primary font-bold">BUS-012 (Route 105)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-theme-border">
                        <span className="text-theme-muted">Timestamp Delta:</span>
                        <span className="text-theme-primary">+4m 43s later</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-theme-border">
                        <span className="text-theme-muted">Haversine Distance:</span>
                        <span className="text-emerald-500 font-bold">8.4m (Within 25m Gate)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-theme-muted">Camera Angle:</span>
                        <span className="text-theme-primary">Front Cam + Right Gutter Cam</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-theme-surface border border-theme-border p-3 rounded-sm">
                    <div className="text-[11px] text-theme-muted mb-2 font-bold">BAYESIAN CONFIDENCE BOOST</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-theme-muted">Prior Confidence:</span>
                        <span className="text-theme-primary">84.0%</span>
                      </div>
                      <div className="w-full bg-theme-panel h-2 rounded-sm overflow-hidden border border-theme-border">
                        <div className="bg-amber-500 h-full" style={{ width: '84%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs pt-2">
                        <span className="text-theme-primary font-semibold">Post-Corroboration:</span>
                        <span className="text-emerald-500 font-bold">98.2%</span>
                      </div>
                      <div className="w-full bg-theme-panel h-2 rounded-sm overflow-hidden border border-theme-border">
                        <div className="bg-emerald-500 h-full" style={{ width: '98.2%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-theme-primary font-bold">AUTO-GENERATED MUNICIPAL ACTION</span>
                  <span className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> TICKET DISPATCHED (WO-2026-8894)
                  </span>
                </div>

                <div className="bg-theme-surface border border-theme-border p-4 space-y-3 rounded-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border pb-3">
                    <div>
                      <div className="text-[11px] text-theme-muted">ASSIGNED AUTHORITY</div>
                      <div className="text-xs font-semibold text-theme-primary mt-0.5">
                        Pune Municipal Corporation (PMC) - Ward 4 Infrastructure Cell
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-theme-muted">PRIORITY LEVEL</div>
                      <div className="text-xs font-bold text-brand mt-0.5">
                        P1 CRITICAL (24-HR SLA)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="bg-theme-panel p-2 border border-theme-border rounded-sm">
                      <div className="text-[10px] text-theme-muted">VERIFYING BUSES</div>
                      <div className="text-theme-primary mt-1 font-semibold">BUS-004 & BUS-012</div>
                    </div>
                    <div className="bg-theme-panel p-2 border border-theme-border rounded-sm">
                      <div className="text-[10px] text-theme-muted">SURFACE DEFECT</div>
                      <div className="text-theme-primary mt-1 font-semibold">Deep Pothole (14cm)</div>
                    </div>
                    <div className="bg-theme-panel p-2 border border-theme-border rounded-sm">
                      <div className="text-[10px] text-theme-muted">GEO LOC</div>
                      <div className="text-theme-primary mt-1 font-semibold">Wakad Overpass</div>
                    </div>
                    <div className="bg-theme-panel p-2 border border-theme-border rounded-sm">
                      <div className="text-[10px] text-theme-muted">SAVINGS VS VAN</div>
                      <div className="text-emerald-500 mt-1 font-semibold">₹14,200 saved</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-14 bg-theme-panel border-t border-theme-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="px-3 py-1.5 text-xs bg-theme-surface hover:bg-theme-elevated disabled:opacity-40 text-theme-primary border border-theme-border rounded-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep(prev => Math.min(2, prev + 1))}
              disabled={activeStep === 2}
              className="px-3 py-1.5 text-xs bg-theme-surface hover:bg-theme-elevated disabled:opacity-40 text-theme-primary border border-theme-border rounded-sm"
            >
              Next Step
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-theme-muted hover:text-theme-primary"
            >
              Close
            </button>
            {onNavigateToCommand && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCommand();
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-brand hover:bg-brand-hover text-white flex items-center gap-1.5 rounded-sm transition-colors"
              >
                Inspect in Command Center <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
