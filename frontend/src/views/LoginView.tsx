import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bus, User, Key, ArrowRight, Zap, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: string) => void;
  onNavigateLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigateLanding }) => {
  const { login, demoLogin, isLoading } = useAuth();
  const [username, setUsername] = useState('operator@demo.urbanpulse.ai');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const u = await login(username, password);
      onLoginSuccess(u.role);
    } catch (err: any) {
      setErrorMsg('Invalid credentials. Try using 1-click Demo Access below.');
    }
  };

  const handleQuickDemoClick = async (roleKey: string, demoEmail: string) => {
    setIsDemoLoading(roleKey);
    setUsername(demoEmail);
    setPassword('password123');
    setErrorMsg('');
    try {
      const u = await demoLogin(roleKey);
      onLoginSuccess(u.role);
    } catch (err: any) {
      setErrorMsg('Failed to log in to demo account.');
    } finally {
      setIsDemoLoading(null);
    }
  };

  const demoRoles = [
    {
      key: 'citizen',
      title: 'Citizen Portal',
      email: 'citizen@demo.urbanpulse.ai',
      roleLabel: 'PUBLIC CITIZEN',
      desc: 'Report road issues, camera capture & earn civic points',
      icon: User,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
    },
    {
      key: 'operator',
      title: 'Municipal Command Center',
      email: 'operator@demo.urbanpulse.ai',
      roleLabel: 'ICCC OPERATOR',
      desc: 'Live city map, road health grid & work order dispatch',
      icon: Shield,
      color: 'border-brand/40 text-brand bg-brand/10 hover:bg-brand/20'
    },
    {
      key: 'fleet',
      title: 'Fleet Monitoring',
      email: 'fleet@demo.urbanpulse.ai',
      roleLabel: 'FLEET OPERATOR',
      desc: 'Bus telemetry, 4-camera feeds & Edge AI status',
      icon: Bus,
      color: 'border-sky-500/40 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20'
    },
    {
      key: 'investigator',
      title: 'Police Evidence & ANPR',
      email: 'investigator@demo.urbanpulse.ai',
      roleLabel: 'AUTHORIZED INVESTIGATOR',
      desc: 'Accident route matching, video clip search & VOI watchlist',
      icon: Lock,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
      key: 'admin',
      title: 'Super Admin',
      email: 'admin@demo.urbanpulse.ai',
      roleLabel: 'SUPER ADMIN',
      desc: 'RBAC user management, notification rules & audit logs',
      icon: Cpu,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-theme-bg text-theme-primary flex flex-col font-sans transition-colors select-none">
      {/* Top Header Ribbon */}
      <header className="h-12 border-b border-theme-border bg-theme-surface px-4 flex items-center justify-between">
        <button onClick={onNavigateLanding} className="flex items-center space-x-2 text-left">
          <div className="w-5 h-5 bg-brand flex items-center justify-center font-bold text-white text-[10px] rounded-sm">
            UP
          </div>
          <span className="font-sans text-sm font-extrabold tracking-tight text-theme-primary">URBANPULSE AI</span>
          <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 bg-theme-elevated text-theme-secondary border border-theme-border rounded-sm">
            SIH 2026 #26124
          </span>
        </button>

        <button
          onClick={onNavigateLanding}
          className="text-xs font-sans font-semibold text-theme-secondary hover:text-theme-primary flex items-center space-x-1 transition-colors"
        >
          <span>← Back to Showcase</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
        {/* Left Side: Brand Narrative */}
        <div className="lg:w-1/2 p-8 lg:p-12 bg-theme-surface/50 border-r border-theme-border flex flex-col justify-between">
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-brand/10 border border-brand/30 text-brand text-xs font-sans rounded-full font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>SMART INDIA HACKATHON 2026 MASTER PROTOTYPE</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-theme-primary leading-tight font-sans uppercase">
              Every Bus. <br />
              <span className="text-brand">A Mobile Sensor.</span> <br />
              One Intelligent City.
            </h1>

            <p className="text-sm text-theme-secondary leading-relaxed font-sans">
              UrbanPulse AI transforms public transit fleets and municipal rovers into a distributed urban intelligence network—enabling continuous road health grid evaluation, real-time traffic flow analytics, women's distress safety, evidence video retrieval, and ANPR vehicle tracking.
            </p>

            {/* Platform Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-sans">
              <div className="p-3 bg-theme-panel border border-theme-border rounded-sm space-y-1">
                <div className="text-brand font-bold">32 BUSES</div>
                <div className="text-theme-muted text-[10px]">Mobile Sensing Fleet</div>
              </div>
              <div className="p-3 bg-theme-panel border border-theme-border rounded-sm space-y-1">
                <div className="text-emerald-500 font-bold">ROAD HEALTH</div>
                <div className="text-theme-muted text-[10px]">GREEN / RED State Grid</div>
              </div>
              <div className="p-3 bg-theme-panel border border-theme-border rounded-sm space-y-1">
                <div className="text-amber-500 font-bold">5 PORTALS</div>
                <div className="text-theme-muted text-[10px]">Role-Scoped Consoles</div>
              </div>
              <div className="p-3 bg-theme-panel border border-theme-border rounded-sm space-y-1">
                <div className="text-purple-500 font-bold">29.4 FPS</div>
                <div className="text-theme-muted text-[10px]">Edge Vision Inference</div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] font-sans text-theme-muted flex justify-between items-center border-t border-theme-border/60">
            <span>URBANPULSE AI ENGINE v2.0-PROD</span>
            <span className="text-emerald-500 font-bold">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Right Side: Login Form & 1-Click SIH Hackathon Demo Selector */}
        <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center space-y-6">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Form Title */}
            <div>
              <h2 className="text-xl font-sans font-bold text-theme-primary">Portal Authentication</h2>
              <p className="text-xs text-theme-secondary mt-0.5">Select a 1-click Demo Role below or enter credentials</p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-brand/10 border border-brand/40 text-brand text-xs font-sans font-medium rounded-sm">
                {errorMsg}
              </div>
            )}

            {/* Standard Credentials Form */}
            <form onSubmit={handleStandardSubmit} className="space-y-3.5 font-sans text-xs">
              <div>
                <label className="text-[11px] font-bold text-theme-secondary block mb-1 uppercase">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border rounded-sm pl-9 pr-3 py-2 text-theme-primary focus:outline-none focus:border-brand font-sans"
                    placeholder="operator@demo.urbanpulse.ai"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-theme-secondary block mb-1 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-theme-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border rounded-sm pl-9 pr-3 py-2 text-theme-primary focus:outline-none focus:border-brand font-sans"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs rounded-sm shadow-md flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider"
              >
                <span>{isLoading ? 'Authenticating...' : 'Login to Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-theme-border"></div>
              <span className="flex-shrink mx-3 text-[10px] font-sans text-theme-muted uppercase font-bold tracking-wider">
                OR SELECT 1-CLICK HACKATHON DEMO ROLE
              </span>
              <div className="flex-grow border-t border-theme-border"></div>
            </div>

            {/* 1-Click SIH Hackathon Demo Selector */}
            <div className="space-y-2 font-sans">
              {demoRoles.map((role) => {
                const Icon = role.icon;
                const isThisLoading = isDemoLoading === role.key;

                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleQuickDemoClick(role.key, role.email)}
                    disabled={!!isDemoLoading}
                    className={`w-full p-3 border rounded-sm transition-all flex items-start justify-between text-left ${role.color}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-theme-surface border border-theme-border rounded-sm mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-sans font-bold text-xs">{role.title}</span>
                          <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 bg-theme-bg border border-theme-border rounded-none">
                            {role.roleLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-theme-secondary font-sans mt-0.5">{role.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-sans font-bold shrink-0 ml-2 mt-1">
                      <span>{isThisLoading ? 'LOGGING IN...' : 'ENTER →'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
