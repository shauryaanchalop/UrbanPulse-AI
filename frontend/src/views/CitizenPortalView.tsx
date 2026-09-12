import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, Shield, Award, MapPin, Send, RefreshCw, Trophy, UserCheck, Flame } from 'lucide-react';
import type { CitizenReport, RewardAccount } from '../types';
import { api } from '../services/api';

interface CitizenPortalViewProps {
  onReportSubmitted?: () => void;
}

export function CitizenPortalView({ onReportSubmitted }: CitizenPortalViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Road Problem' | 'Accident / Incident' | 'Safety / Distress' | 'Traffic Issue' | 'Other' | null>(null);
  const [description, setDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ classification: string; confidence: number; severity: string } | null>(null);
  const [submittedReport, setSubmittedReport] = useState<CitizenReport | null>(null);

  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [leaderboard, setLeaderboard] = useState<RewardAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'report' | 'my-reports' | 'rewards'>('report');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [repData, leadData] = await Promise.all([
        api.getCitizenReports(),
        api.getRewardLeaderboard()
      ]);
      setReports(repData);
      setLeaderboard(leadData);
    } catch (err) {
      console.error('Failed to load citizen portal data', err);
    }
  };

  const handleStartCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setCapturedPhoto('/evidence/road_defect_1.jpg');
      setIsCapturing(false);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAiResult({
          classification: selectedCategory === 'Road Problem' ? 'Pothole Defect (Severe)' : (selectedCategory === 'Safety / Distress' ? 'Public Safety Threat' : 'Traffic Hazard'),
          confidence: 0.94,
          severity: 'High'
        });
      }, 1200);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    try {
      const newReport = await api.submitCitizenReport({
        category: selectedCategory,
        description: description || 'Citizen reported via UrbanPulse AI Mobile App',
        photoUrl: capturedPhoto || '/evidence/road_defect_1.jpg',
        latitude: 18.5912,
        longitude: 73.7389
      });
      setSubmittedReport(newReport);
      loadData();
      if (onReportSubmitted) onReportSubmitted();
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };

  const handleResetForm = () => {
    setSelectedCategory(null);
    setDescription('');
    setCapturedPhoto(null);
    setAiResult(null);
    setSubmittedReport(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Mobile Top Header */}
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/30">
            UP
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">UrbanPulse AI</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Citizen Urban Network</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full text-xs font-mono text-amber-400 border border-amber-500/20">
          <Award className="w-3.5 h-3.5" />
          <span className="font-bold">1,450 pts</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 sticky top-13 z-20 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors ${
            activeTab === 'report' ? 'border-red-500 text-red-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          REPORT A PROBLEM
        </button>
        <button
          onClick={() => setActiveTab('my-reports')}
          className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors ${
            activeTab === 'my-reports' ? 'border-red-500 text-red-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          MY REPORTS ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors ${
            activeTab === 'rewards' ? 'border-red-500 text-red-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          REWARDS & LEADERBOARD
        </button>
      </div>

      {/* Main Area */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {activeTab === 'report' && (
          <div className="space-y-5">
            {submittedReport ? (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Report Submitted Successfully!</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Ref: #{submittedReport.referenceNo}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-white">{submittedReport.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Classification:</span>
                    <span className="font-semibold text-emerald-400">{submittedReport.aiClassification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Points Earned:</span>
                    <span className="font-bold text-amber-400">+{submittedReport.pointsAwarded} PTS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px]">
                      {submittedReport.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleResetForm}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <>
                {/* Step 1: Select Category */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                    1. Select Problem Category
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'Road Problem', label: 'Road Problem', desc: 'Pothole, Crack, Marking' },
                      { id: 'Accident / Incident', label: 'Accident / Incident', desc: 'Vehicle collision, obstruction' },
                      { id: 'Safety / Distress', label: 'Safety / Distress', desc: 'Lighting, unsafe zone' },
                      { id: 'Traffic Issue', label: 'Traffic Issue', desc: 'Congestion, signal failure' },
                      { id: 'Other', label: 'Other Anomaly', desc: 'General civic issue' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedCategory(item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedCategory === item.id
                            ? 'bg-red-950/40 border-red-500 text-white ring-1 ring-red-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-slate-100">{item.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Camera Capture */}
                {selectedCategory && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      2. Capture Visual Evidence
                    </label>
                    
                    {!capturedPhoto ? (
                      <button
                        onClick={handleStartCapture}
                        disabled={isCapturing}
                        className="w-full py-8 bg-slate-900 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Camera className="w-8 h-8 text-red-500 animate-pulse" />
                        <span className="text-xs font-medium">
                          {isCapturing ? 'Opening Camera & Accessing GPS...' : 'Tap to Open Camera & Take Photo'}
                        </span>
                      </button>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800">
                        <img src={capturedPhoto} alt="Captured evidence" className="w-full h-44 object-cover" />
                        <button
                          onClick={() => setCapturedPhoto(null)}
                          className="absolute top-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white text-[10px] rounded font-mono"
                        >
                          Retake
                        </button>
                      </div>
                    )}

                    {/* AI Classification Feedback */}
                    {isAnalyzing && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center space-x-3 text-xs text-slate-300">
                        <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
                        <span>AI model analyzing visual report & geolocating...</span>
                      </div>
                    )}

                    {aiResult && (
                      <div className="p-3.5 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">AI Classification:</span>
                          <span className="font-bold text-emerald-400">{aiResult.classification}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Confidence:</span>
                          <span className="font-mono text-slate-200">{(aiResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Estimated Severity:</span>
                          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[10px]">
                            {aiResult.severity}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Optional Note / Details
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add additional context (e.g. near school gate, deep cavity...)"
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!capturedPhoto && !aiResult}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>SUBMIT REPORT</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'my-reports' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report History & Live Tracking</h3>
            {reports.map((rep) => (
              <div key={rep.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">#{rep.referenceNo}</h4>
                    <p className="text-[11px] text-slate-400">{rep.category} • {rep.submittedAt}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 font-semibold">
                    {rep.status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{rep.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>AI: {rep.aiClassification || 'Pothole'}</span>
                  <span className="text-amber-400 font-bold">+{rep.pointsAwarded} PTS</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="bg-gradient-to-r from-red-950 to-slate-900 border border-red-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm">
                    RS
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Rahul Sharma</h3>
                    <p className="text-[10px] text-amber-400 font-mono">LEVEL: GOLD CITIZEN</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-amber-400 font-mono">1,450</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">CIVIC POINTS</div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">Earned Badges</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Road Watcher', 'Safety Reporter', 'Community Monitor', 'Urban Sentinel'].map((b) => (
                    <span key={b} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-medium flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Top Civic Contributors</span>
                <span className="text-[10px] text-slate-500 font-mono">THIS MONTH</span>
              </h3>

              {leaderboard.map((user, idx) => (
                <div key={user.userId} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className={`w-5 font-mono text-center font-bold ${idx === 0 ? 'text-amber-400 text-sm' : 'text-slate-500'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{user.displayName}</h4>
                      <p className="text-[10px] text-slate-400">{user.verifiedReportCount} verified reports</p>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-amber-400">
                    {user.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
