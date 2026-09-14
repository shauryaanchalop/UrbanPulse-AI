import React, { useState } from 'react';
import type { UserRole } from '../types';
import { 
  Play, Pause, RotateCcw, Zap, Bell, Shield, 
  ChevronDown, ArrowLeft, Search, Monitor, X, Cpu, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './common/BrandLogo';
import { useTheme } from '../context/ThemeContext';
import { ModelInspectorModal } from './common/ModelInspectorModal';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isSimRunning: boolean;
  simSpeed: number;
  onToggleSim: () => void;
  onResetSim: () => void;
  onSetSpeed: (speed: number) => void;
  onStartDemo: () => void;
  isDemoActive: boolean;
  elapsedSeconds: number;
  unreadNotifications: number;
  recentAlerts: string[];
  onNavigateHome?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleKiosk?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isSimRunning,
  simSpeed,
  onToggleSim,
  onResetSim,
  onSetSpeed,
  onStartDemo,
  isDemoActive,
  elapsedSeconds,
  unreadNotifications,
  recentAlerts,
  onNavigateHome,
  onOpenCommandPalette,
  onToggleKiosk,
  onNavigateTab
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showModelInspector, setShowModelInspector] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Pune Smart City');
  const [readNotifs, setReadNotifs] = useState<Set<number>>(new Set());
  const [selectedNotifIndex, setSelectedNotifIndex] = useState<number | null>(null);

  const roles: UserRole[] = [
    'Command Center Operator',
    'Municipal Road Engineer',
    'Traffic Control Officer',
    'Fleet Administrator'
  ];

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleMarkAllRead = () => {
    const allIndices = new Set(recentAlerts.map((_, idx) => idx));
    setReadNotifs(allIndices);
  };

  const activeCount = Math.max(0, unreadNotifications - readNotifs.size);

  return (
    <>
      <header className="h-12 bg-theme-surface/90 backdrop-blur-md border-b border-theme-border px-4 flex items-center justify-between select-none z-30 shrink-0 font-sans text-xs transition-all shadow-sm">
        {/* Left Section: Brand Logo & Sector ML Status Pill */}
        <div className="flex items-center gap-3 shrink-0">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-theme-panel hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-border text-xs font-sans font-semibold rounded-md transition-colors whitespace-nowrap"
              title="Return to Public Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline font-bold">PORTAL</span>
            </button>
          )}

          <BrandLogo 
            size="sm" 
            subtitle="MUNICIPAL ICCC" 
            className="pr-3 border-r border-theme-border shrink-0 cursor-pointer" 
            onClick={onNavigateHome}
          />

          {/* Integrated Sector & ML Model Status Badge */}
          <div className="hidden md:flex items-center bg-theme-panel border border-theme-border rounded-full p-1 gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(false)}
                className="flex items-center gap-1.5 px-3 py-1 bg-theme-surface hover:bg-theme-elevated text-theme-primary font-sans text-xs font-semibold rounded-full border border-theme-border/80 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                onClickCapture={() => {}}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{selectedCity.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-theme-muted" />
              </button>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Switch Operational Fleet Sector"
              >
                <option value="Pune Smart City" className="bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-white light:bg-white light:text-slate-900">PUNE METRO (105 BUSES)</option>
                <option value="Bengaluru Urban" className="bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-white light:bg-white light:text-slate-900">BENGALURU URBAN (BMTC)</option>
                <option value="Delhi NCR" className="bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-white light:bg-white light:text-slate-900">DELHI NCR (BRTS)</option>
              </select>
            </div>

            <button 
              onClick={() => setShowModelInspector(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-sans text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap shadow-sm" 
              title="Inspect Deployed YOLOv8-ONNX Edge AI Model"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>YOLOv8-ONNX ML</span>
              <span className="text-[10px] font-sans opacity-90 font-bold bg-emerald-500/20 px-1 rounded">(89.4% mAP)</span>
            </button>
          </div>
        </div>

        {/* Center Section: Unified Simulation Controller Pod */}
        <div className="flex items-center bg-theme-panel border border-theme-border p-1 rounded-full shadow-inner gap-2 whitespace-nowrap shrink-0">
          <button
            onClick={onStartDemo}
            className={`flex items-center gap-1.5 px-3 py-1 font-sans text-xs font-bold transition rounded-full shadow-md whitespace-nowrap shrink-0 ${
              isDemoActive 
                ? 'bg-amber-500 border border-amber-400 text-black font-bold animate-pulse' 
                : 'bg-brand text-white hover:bg-brand-hover border border-brand'
            }`}
            title="Run automated SIH scenario"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isDemoActive ? 'DEMO ACTIVE' : 'RUN SIH DEMO'}</span>
          </button>

          <div className="px-3 font-mono text-xs text-theme-primary bg-theme-surface border-x border-theme-border font-extrabold whitespace-nowrap rounded-sm py-0.5">
            {formatElapsed(elapsedSeconds)}
          </div>

          <button
            onClick={onToggleSim}
            className="px-2.5 py-1 text-xs font-sans border border-theme-border hover:bg-theme-elevated text-theme-primary flex items-center gap-1.5 rounded-full transition whitespace-nowrap font-semibold"
            title={isSimRunning ? 'Pause simulation loop' : 'Resume simulation loop'}
          >
            {isSimRunning ? <Pause className="w-3.5 h-3.5 text-emerald-500" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
            <span>{isSimRunning ? 'RUNNING' : 'PAUSED'}</span>
          </button>

          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-0.5 font-sans text-xs font-semibold text-theme-secondary hover:text-theme-primary bg-theme-surface border border-theme-border rounded-full flex items-center gap-1"
              title="Simulation speed multiplier"
            >
              <span className="font-mono">{simSpeed}x</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showSpeedMenu && (
              <div className="absolute top-full mt-1 right-0 bg-theme-surface border border-theme-border shadow-xl rounded-md p-1 z-50 font-sans text-xs flex flex-col gap-1">
                {[1, 2, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      onSetSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-3 py-1 rounded-md text-left font-semibold transition-colors ${
                      simSpeed === s ? 'bg-brand text-white' : 'text-theme-secondary hover:bg-theme-elevated hover:text-theme-primary'
                    }`}
                  >
                    <span className="font-mono">{s}x</span> Speed
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onResetSim}
            className="p-1 text-theme-muted hover:text-brand hover:bg-theme-elevated transition rounded-full"
            title="Reset simulation loop"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Section: Command Palette, Kiosk, Theme Toggle, Alerts, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden xl:flex items-center gap-2 px-3 py-1 bg-theme-panel hover:bg-theme-elevated text-theme-muted hover:text-theme-primary border border-theme-border text-xs font-sans font-medium rounded-md transition-colors whitespace-nowrap"
              title="Open Command Palette (Ctrl+K or /)"
            >
              <Search className="w-3.5 h-3.5 text-brand" />
              <span>Search...</span>
              <kbd className="px-1 text-[10px] bg-theme-elevated border border-theme-border rounded-sm font-sans font-bold">Ctrl+K</kbd>
            </button>
          )}

          {onToggleKiosk && (
            <button
              onClick={onToggleKiosk}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-theme-panel hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-border text-xs font-sans font-semibold rounded-md transition-colors whitespace-nowrap"
              title="Full-Screen Command Center Video Wall Display (Key 'K')"
            >
              <Monitor className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline font-bold">KIOSK</span>
            </button>
          )}

          {/* Simple Theme Toggle Icon Button */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 bg-theme-panel border border-theme-border hover:bg-theme-elevated text-theme-primary rounded-md transition-colors"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand" />}
          </button>

          {/* Operational Notifications Popup Modal */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 bg-theme-panel border border-theme-border hover:bg-theme-elevated text-theme-primary rounded-md relative transition-colors"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4 text-theme-secondary" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] font-sans font-bold px-1.5 rounded-full leading-tight shadow-md">
                  {activeCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-theme-surface border border-theme-border shadow-2xl z-50 text-xs rounded-md overflow-hidden font-sans">
                <div className="p-3 border-b border-theme-border bg-theme-panel flex justify-between items-center">
                  <span className="text-xs font-bold text-theme-primary">NOTIFICATION CENTER</span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleMarkAllRead} className="text-[10px] text-brand hover:underline font-bold">
                      MARK ALL READ
                    </button>
                    <button onClick={() => setShowNotifications(false)} className="text-theme-muted hover:text-theme-primary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-theme-border">
                  {recentAlerts.map((alert, idx) => {
                    const isRead = readNotifs.has(idx);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setSelectedNotifIndex(idx);
                          setReadNotifs(prev => new Set(prev).add(idx));
                        }}
                        className={`p-3 cursor-pointer hover:bg-theme-elevated transition-colors text-xs ${
                          isRead ? 'opacity-60 text-theme-muted' : 'text-theme-primary font-semibold'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-brand font-bold text-sm leading-none">•</span>
                          <div className="flex-1 space-y-0.5">
                            <div>{alert}</div>
                            <div className="text-[10px] text-theme-muted flex justify-between pt-1">
                              <span>Sector 18 • Urban Sensor</span>
                              <span className="font-semibold">{isRead ? 'READ' : 'UNREAD'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Operator Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-theme-panel border border-theme-border px-3 py-1 text-xs text-theme-primary hover:bg-theme-elevated font-sans font-semibold rounded-md whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5 text-brand" />
              <span className="hidden md:inline truncate max-w-[130px] font-bold whitespace-nowrap">{currentRole.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-theme-muted" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-theme-surface border border-theme-border shadow-2xl z-50 p-1.5 rounded-md font-sans">
                <div className="text-[10px] text-theme-muted px-2 py-1 uppercase tracking-wider font-bold">
                  Select Operator Role
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-xs font-sans font-medium flex items-center justify-between rounded-md ${
                      currentRole === r ? 'bg-brand/10 text-brand font-bold' : 'text-theme-secondary hover:bg-theme-elevated'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <span className="text-brand text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Model Inspector Modal */}
      <ModelInspectorModal
        isOpen={showModelInspector}
        onClose={() => setShowModelInspector(false)}
      />
    </>
  );
};
