import React from 'react';
import { Zap, X, ChevronRight } from 'lucide-react';

interface ScriptedDemoOverlayProps {
  isDemoActive: boolean;
  demoStepIndex: number;
  demoDescription: string;
  elapsedSeconds: number;
  onCloseDemo: () => void;
}

export const ScriptedDemoOverlay: React.FC<ScriptedDemoOverlayProps> = ({
  isDemoActive,
  demoStepIndex,
  demoDescription,
  elapsedSeconds,
  onCloseDemo,
}) => {
  if (!isDemoActive) return null;

  const totalSteps = 12;
  const progressPercent = Math.min(100, (demoStepIndex / totalSteps) * 100);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed bottom-0 left-52 right-0 bg-graphite-950/95 backdrop-blur-sm border-t border-brand z-40 px-3 py-2 text-xs font-mono select-none flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-brand font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
          <span>SCRIPTED SIH DEMO:</span>
          <span className="text-white bg-graphite-800 border border-graphite-700 px-1.5 py-0.5 rounded-sm">
            STEP {demoStepIndex}/{totalSteps}
          </span>
        </div>

        <div className="text-slate-200 text-[11px] truncate max-w-xl">
          {demoDescription}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Step Progress Mini-bar */}
        <div className="w-32 bg-graphite-800 h-1.5 overflow-hidden rounded-sm">
          <div className="bg-brand h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <span className="text-[11px] text-graphite-400">
          ELAPSED: <b className="text-white">{formatElapsed(elapsedSeconds)}</b> / 05:00
        </span>

        <button
          onClick={onCloseDemo}
          className="px-2 py-0.5 bg-graphite-800 hover:bg-graphite-700 text-slate-300 border border-graphite-700 text-[10px] rounded-sm transition-colors"
        >
          DISMISS
        </button>
      </div>
    </div>
  );
};
