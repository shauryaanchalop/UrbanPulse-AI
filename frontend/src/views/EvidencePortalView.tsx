import React, { useState } from 'react';
import { Video, Search, Filter, Play, Pause, Download, Shield, FilePlus, Check } from 'lucide-react';
import type { VideoClip, Bus, SafetyIncident } from '../types';
import { api } from '../services/api';

interface EvidencePortalViewProps {
  buses?: Bus[];
  incidents?: SafetyIncident[];
}

const DEFAULT_DEMO_CLIPS: VideoClip[] = [
  {
    id: 'CLIP-004-F',
    busId: 'BUS-004',
    cameraName: 'front',
    startTime: '2026-09-14 10:14:15',
    endTime: '2026-09-14 10:14:45',
    latitude: 18.5915,
    longitude: 73.7391,
    address: 'Wakad Flyover Ramp, Sector 18',
    videoUrl: '/evidence/clip_event_1.mp4',
    thumbnailUrl: '/evidence/incident_frame_1.jpg',
    relevanceScore: 0.98,
    matchedEvents: ['Hit & Run Alert (UP-16-AB-1234)', 'Barrier Collision Impact'],
    distanceMeters: 34.2,
    timeDeltaSeconds: 8.0
  },
  {
    id: 'CLIP-015-R',
    busId: 'BUS-015',
    cameraName: 'rear',
    startTime: '2026-09-14 10:13:50',
    endTime: '2026-09-14 10:14:20',
    latitude: 18.5922,
    longitude: 73.7398,
    address: 'Wakad Chowk Flyover Approach',
    videoUrl: '/evidence/clip_event_2.mp4',
    thumbnailUrl: '/evidence/incident_frame_2.jpg',
    relevanceScore: 0.95,
    matchedEvents: ['Rash Driving (MH-12-EV-4412)', 'BRTS Lane Intrusion'],
    distanceMeters: 72.0,
    timeDeltaSeconds: 19.0
  },
  {
    id: 'CLIP-031-F',
    busId: 'BUS-031',
    cameraName: 'front',
    startTime: '2026-09-14 10:13:00',
    endTime: '2026-09-14 10:13:30',
    latitude: 18.5898,
    longitude: 73.7375,
    address: 'Bhumkar Chowk Underpass Corridor',
    videoUrl: '/evidence/clip_event_3.mp4',
    thumbnailUrl: '/evidence/incident_frame_3.jpg',
    relevanceScore: 0.92,
    matchedEvents: ['Abrupt Lane Change', 'High Speeding Alert'],
    distanceMeters: 115.4,
    timeDeltaSeconds: 42.0
  },
  {
    id: 'CLIP-007-L',
    busId: 'BUS-007',
    cameraName: 'left',
    startTime: '2026-09-14 10:12:10',
    endTime: '2026-09-14 10:12:40',
    latitude: 18.5362,
    longitude: 73.8301,
    address: 'University Circle Grade Separator',
    videoUrl: '/evidence/clip_event_4.mp4',
    thumbnailUrl: '/evidence/incident_frame_4.jpg',
    relevanceScore: 0.89,
    matchedEvents: ['Dangerous Pedestrian Proximity', 'Emergency Braking Assist'],
    distanceMeters: 180.1,
    timeDeltaSeconds: 64.0
  },
  {
    id: 'CLIP-022-R',
    busId: 'BUS-022',
    cameraName: 'right',
    startTime: '2026-09-14 10:11:00',
    endTime: '2026-09-14 10:11:30',
    latitude: 18.5491,
    longitude: 73.9015,
    address: 'Kalyani Nagar Main Road Junction',
    videoUrl: '/evidence/clip_event_5.mp4',
    thumbnailUrl: '/evidence/incident_frame_5.jpg',
    relevanceScore: 0.86,
    matchedEvents: ['Illegal U-Turn', 'Signal Compliance Violation'],
    distanceMeters: 240.5,
    timeDeltaSeconds: 95.0
  }
];

export function EvidencePortalView({ buses = [], incidents = [] }: EvidencePortalViewProps) {
  const [location, setLocation] = useState('Sector 18 - Wakad Bridge Flyover');
  const [date, setDate] = useState('2026-09-14');
  const [approxTime, setApproxTime] = useState('10:14');
  const [incidentCategory, setIncidentCategory] = useState('Vehicle Collision / Hit & Run');
  const [radiusMeters, setRadiusMeters] = useState(500);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ caseRef: string; clips: VideoClip[] }>({
    caseRef: 'EV-2026-884912',
    clips: DEFAULT_DEMO_CLIPS
  });
  const [activeClip, setActiveClip] = useState<VideoClip>(DEFAULT_DEMO_CLIPS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [addedCaseClips, setAddedCaseClips] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const data = await api.searchEvidence({
        latitude: 18.5912,
        longitude: 73.7389,
        radiusMeters: radiusMeters
      });

      let formatted: { caseRef: string; clips: VideoClip[] };
      if (Array.isArray(data)) {
        formatted = { caseRef: `EV-2026-${Math.floor(100000 + Math.random() * 900000)}`, clips: data };
      } else if (data && Array.isArray(data.clips)) {
        formatted = data;
      } else {
        formatted = { caseRef: `EV-2026-${Math.floor(100000 + Math.random() * 900000)}`, clips: DEFAULT_DEMO_CLIPS };
      }

      setSearchResults(formatted);
      if (formatted.clips && formatted.clips.length > 0) {
        setActiveClip(formatted.clips[0]);
      }
    } catch (err) {
      console.error('Failed to search evidence', err);
      // Resilience fallback
      const fallback = {
        caseRef: `EV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        clips: DEFAULT_DEMO_CLIPS
      };
      setSearchResults(fallback);
      setActiveClip(fallback.clips[0]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleAddToCase = (clipId: string) => {
    setAddedCaseClips(prev => new Set(prev).add(clipId));
  };

  const clipsList = searchResults?.clips || DEFAULT_DEMO_CLIPS;
  const caseReference = searchResults?.caseRef || 'EV-2026-884912';

  return (
    <div className="h-full w-full bg-theme-bg text-theme-primary flex flex-col p-6 overflow-y-auto font-sans space-y-6 transition-colors select-none">
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-theme-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-brand" />
            <h1 className="text-xl font-bold tracking-tight text-theme-primary">Video & Urban Evidence Retrieval Engine</h1>
          </div>
          <p className="text-xs text-theme-muted font-mono mt-1">
            "Don't search hours of footage. Search the incident." — Geospatial trajectory & timestamp clip matcher.
          </p>
        </div>
        <div className="px-3 py-1 bg-brand/10 border border-brand/40 text-brand font-mono text-xs rounded-sm flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5" />
          <span>AUTHORIZED INVESTIGATOR PORTAL</span>
        </div>
      </div>

      {/* Query Form */}
      <div className="bg-theme-surface border border-theme-border rounded-sm p-5 space-y-4 text-xs shadow-sm">
        <h3 className="font-bold text-theme-primary uppercase text-xs tracking-wider flex items-center space-x-2 font-mono">
          <Filter className="w-4 h-4 text-brand" />
          <span>Incident Query Criteria</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-sans">
          <div>
            <label className="text-[10px] text-theme-muted font-mono block mb-1 uppercase font-bold">Incident Location / Corridor</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-xs text-theme-primary focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-[10px] text-theme-muted font-mono block mb-1 uppercase font-bold">Approximate Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-xs text-theme-primary focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-[10px] text-theme-muted font-mono block mb-1 uppercase font-bold">Time & Window</label>
            <input
              type="text"
              value={approxTime}
              onChange={(e) => setApproxTime(e.target.value)}
              className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-xs text-theme-primary focus:outline-none focus:border-brand font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-theme-muted font-mono block mb-1 uppercase font-bold">Incident Type</label>
            <select
              value={incidentCategory}
              onChange={(e) => setIncidentCategory(e.target.value)}
              className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-xs text-theme-primary focus:outline-none focus:border-brand"
            >
              <option>Vehicle Collision / Hit & Run</option>
              <option>Road Anomaly / Pothole Impact</option>
              <option>Pedestrian Safety Incident</option>
              <option>BRTS Lane Violation</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 font-mono">
          <div className="flex items-center space-x-2 text-theme-muted text-[11px]">
            <span>Search Radius:</span>
            <span className="text-theme-primary font-bold">{radiusMeters} meters</span>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs rounded-sm shadow-md flex items-center space-x-2 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'SEARCHING BUS TRAJECTORIES...' : 'SEARCH INCIDENT CLIPS'}</span>
          </button>
        </div>
      </div>

      {/* Results Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Clip Player (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-theme-surface border border-theme-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-3 bg-theme-panel border-b border-theme-border flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-theme-primary">CASE #{caseReference}</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] font-bold">FORENSIC EVIDENCE</span>
              </div>
              <span className="text-emerald-500 font-bold">
                MATCH RELEVANCE: {activeClip ? `${((activeClip.relevanceScore || 0.95) * 100).toFixed(0)}%` : '96%'}
              </span>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={activeClip?.thumbnailUrl || '/evidence/incident_frame_1.jpg'}
                alt="Clip preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={handleTogglePlay}
                  className="w-16 h-16 rounded-full bg-brand/90 hover:bg-brand text-white flex items-center justify-center cursor-pointer shadow-xl transition-all"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-sm border border-slate-700 text-xs font-mono text-slate-200">
                NODE: {activeClip?.busId || 'BUS-004'} • CAM: {(activeClip?.cameraName || 'front').toUpperCase()} • {activeClip?.startTime || '10:14:15'}
              </div>
            </div>
            <div className="p-4 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-theme-primary">{activeClip?.address || 'Wakad Flyover Ramp'}</h4>
                <p className="text-theme-muted text-[11px] font-mono">
                  Matched events: {(activeClip?.matchedEvents || ['Hit & Run Alert']).join(', ')}
                </p>
              </div>
              <div className="flex space-x-2 font-mono">
                <button
                  onClick={() => activeClip && handleAddToCase(activeClip.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-sm flex items-center space-x-1 border cursor-pointer ${
                    activeClip && addedCaseClips.has(activeClip.id)
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-theme-panel border-theme-border text-theme-primary hover:bg-theme-elevated'
                  }`}
                >
                  {activeClip && addedCaseClips.has(activeClip.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>ADDED TO CASE</span>
                    </>
                  ) : (
                    <>
                      <FilePlus className="w-3.5 h-3.5 text-brand" />
                      <span>ADD TO CASE</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => alert(`Exporting forensic evidence package for ${activeClip?.busId}`)}
                  className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-sm text-xs flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT EVIDENCE</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matches List (Right 1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider font-mono">
            Ranked Evidence Clips ({clipsList.length})
          </h3>
          {clipsList.map((clip) => (
            <div
              key={clip.id}
              onClick={() => setActiveClip(clip)}
              className={`p-3 rounded-sm border cursor-pointer transition-all space-y-2 text-xs ${
                activeClip?.id === clip.id
                  ? 'bg-theme-elevated border-brand shadow-sm'
                  : 'bg-theme-surface border-theme-border hover:border-theme-border-strong'
              }`}
            >
              <div className="flex justify-between items-start font-mono">
                <div>
                  <h4 className="font-bold text-theme-primary">{clip.busId} • CAM-{(clip.cameraName || 'front').toUpperCase()}</h4>
                  <p className="text-[11px] text-theme-muted">{clip.startTime}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold">
                  {((clip.relevanceScore || 0.95) * 100).toFixed(0)}% MATCH
                </span>
              </div>
              <div className="text-[11px] text-theme-secondary font-mono flex justify-between">
                <span>Distance: {clip.distanceMeters || 46}m</span>
                <span>Delta: {clip.timeDeltaSeconds || 12}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

