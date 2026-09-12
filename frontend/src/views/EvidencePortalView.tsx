import React, { useState } from 'react';
import { Video, Search, Calendar, Clock, MapPin, Filter, Play, Download, Shield, AlertCircle, FilePlus } from 'lucide-react';
import type { VideoClip, Bus, SafetyIncident } from '../types';
import { api } from '../services/api';

interface EvidencePortalViewProps {
  buses?: Bus[];
  incidents?: SafetyIncident[];
}

export function EvidencePortalView({ buses = [], incidents = [] }: EvidencePortalViewProps) {
  const [location, setLocation] = useState('Sector 18 - Wakad Bridge Flyover');
  const [date, setDate] = useState('2026-09-12');
  const [approxTime, setApproxTime] = useState('14:30');
  const [incidentCategory, setIncidentCategory] = useState('Vehicle Collision / Hit & Run');
  const [radiusMeters, setRadiusMeters] = useState(500);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ caseRef: string; clips: VideoClip[] } | null>(null);
  const [activeClip, setActiveClip] = useState<VideoClip | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const data = await api.searchEvidence({
        latitude: 18.5912,
        longitude: 73.7389,
        radiusMeters: radiusMeters
      });
      setSearchResults(data);
      if (data.clips && data.clips.length > 0) {
        setActiveClip(data.clips[0]);
      }
    } catch (err) {
      console.error('Failed to search evidence', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col p-6 overflow-y-auto font-sans space-y-6">
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">Video & Urban Evidence Retrieval Engine</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            "Don't search hours of footage. Search the incident." — Geospatial trajectory & timestamp clip matcher.
          </p>
        </div>
        <div className="px-3 py-1 bg-purple-950/60 border border-purple-800 text-purple-400 font-mono text-xs rounded-lg flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5" />
          <span>AUTHORIZED INVESTIGATOR PORTAL</span>
        </div>
      </div>

      {/* Query Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
        <h3 className="font-bold text-white uppercase text-xs tracking-wider flex items-center space-x-2">
          <Filter className="w-4 h-4 text-red-400" />
          <span>Incident Query Criteria</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 font-mono block mb-1">Incident Location / Corridor</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-mono block mb-1">Approximate Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-mono block mb-1">Time & Window</label>
            <input
              type="text"
              value={approxTime}
              onChange={(e) => setApproxTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-mono block mb-1">Incident Type</label>
            <select
              value={incidentCategory}
              onChange={(e) => setIncidentCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option>Vehicle Collision / Hit & Run</option>
              <option>Road Anomaly / Pothole Impact</option>
              <option>Pedestrian Safety Incident</option>
              <option>BRTS Lane Violation</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <span>Search Radius:</span>
            <span className="font-mono text-white font-bold">{radiusMeters} meters</span>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-lg shadow-red-900/30 flex items-center space-x-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'SEARCHING BUS TRAJECTORIES...' : 'SEARCH INCIDENT CLIPS'}</span>
          </button>
        </div>
      </div>

      {/* Results Workspace */}
      {searchResults && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Clip Player (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-white">CASE #{searchResults.caseRef}</span>
                <span className="font-mono text-emerald-400">
                  MATCH RELEVANCE: {activeClip ? `${(activeClip.relevanceScore * 100).toFixed(0)}%` : '96%'}
                </span>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src={activeClip?.thumbnailUrl || '/evidence/incident_frame_1.jpg'}
                  alt="Clip preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer shadow-xl transition-all">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-200">
                  NODE: {activeClip?.busId || 'BUS-004'} • CAM: {activeClip?.cameraName || 'front'} • {activeClip?.startTime}
                </div>
              </div>
              <div className="p-4 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white">{activeClip?.address || 'Wakad Flyover Ramp'}</h4>
                  <p className="text-slate-400 text-[11px]">Matched events: {activeClip?.matchedEvents?.join(', ')}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded text-xs flex items-center space-x-1">
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Add to Case</span>
                  </button>
                  <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Evidence</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Matches List (Right 1 col) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Ranked Evidence Clips ({searchResults.clips.length})
            </h3>
            {searchResults.clips.map((clip, idx) => (
              <div
                key={clip.id}
                onClick={() => setActiveClip(clip)}
                className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 text-xs ${
                  activeClip?.id === clip.id
                    ? 'bg-slate-900 border-red-500 ring-1 ring-red-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white font-mono">{clip.busId} • CAM-{clip.cameraName.toUpperCase()}</h4>
                    <p className="text-[11px] text-slate-400">{clip.startTime}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    {(clip.relevanceScore * 100).toFixed(0)}% MATCH
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <span>Distance: {clip.distanceMeters || 46}m</span> • <span>Delta: {clip.timeDeltaSeconds || 12}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
