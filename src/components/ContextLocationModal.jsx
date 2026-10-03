import React, { useState } from 'react';
import { MapPin, Monitor, RefreshCw, X, Check, ShieldCheck, Globe, Cpu, Smartphone } from 'lucide-react';
import { PRESET_LOCATIONS, PRESET_BROWSER_CONTEXTS, createSubBrowserIdentity } from '../utils/contextHelper';

export default function ContextLocationModal({
  isOpen,
  onClose,
  tab,
  onApplyIdentity
}) {
  if (!isOpen || !tab) return null;

  const currentLocId = tab.location?.id || PRESET_LOCATIONS[0].id;
  const currentCtxId = tab.context?.id || PRESET_BROWSER_CONTEXTS[0].id;

  const [selectedLocId, setSelectedLocId] = useState(currentLocId);
  const [selectedCtxId, setSelectedCtxId] = useState(currentCtxId);

  const selectedLoc = PRESET_LOCATIONS.find(l => l.id === selectedLocId) || PRESET_LOCATIONS[0];
  const selectedCtx = PRESET_BROWSER_CONTEXTS.find(c => c.id === selectedCtxId) || PRESET_BROWSER_CONTEXTS[0];

  const handleRandomize = () => {
    const randomLocIndex = Math.floor(Math.random() * PRESET_LOCATIONS.length);
    const randomCtxIndex = Math.floor(Math.random() * PRESET_BROWSER_CONTEXTS.length);
    setSelectedLocId(PRESET_LOCATIONS[randomLocIndex].id);
    setSelectedCtxId(PRESET_BROWSER_CONTEXTS[randomCtxIndex].id);
  };

  const handleSave = () => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    onApplyIdentity(tab.id, {
      location: selectedLoc,
      context: selectedCtx,
      sessionId: tab.sessionId || newSessionId,
      refreshKey: (tab.refreshKey || 0) + 1
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Globe size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                Sub-Browser Identity & Location Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure unique region, IP geolocation, user-agent, and session context for {tab.browserLabel || tab.title || 'this pane'}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Active Identity Summary Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} /> Active Location Profile
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <span className="text-lg">{selectedLoc.flag}</span>
                <span>{selectedLoc.city}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                IP: <span className="text-emerald-400">{selectedLoc.ip}</span> | Timezone: {selectedLoc.timezone}
              </div>
              <div className="text-slate-500 font-mono text-[10px]">
                Geo: Lat {selectedLoc.latitude}, Lng {selectedLoc.longitude}
              </div>
            </div>

            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor size={13} /> Browser Context Profile
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <span className="text-lg">{selectedCtx.icon}</span>
                <span>{selectedCtx.name}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] truncate" title={selectedCtx.userAgent}>
                UA: {selectedCtx.userAgent}
              </div>
              <div className="text-slate-500 font-mono text-[10px]">
                Platform: {selectedCtx.platform} | Session: {tab.sessionId || 'Isolated Sub-Browser Session'}
              </div>
            </div>
          </div>

          {/* Location Selection Section */}
          <div className="space-y-3">
            <label className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <MapPin size={14} className="text-cyan-400" /> Select Geographic Location & IP Region:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_LOCATIONS.map((loc) => {
                const isSelected = loc.id === selectedLocId;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedLocId(loc.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{loc.flag}</span>
                      {isSelected && <Check size={14} className="text-cyan-400" />}
                    </div>
                    <div className="font-bold text-xs">{loc.city}</div>
                    <div className="text-[10px] font-mono text-slate-500">IP: {loc.ip}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browser Context Selection Section */}
          <div className="space-y-3">
            <label className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Monitor size={14} className="text-purple-400" /> Select Device & User-Agent Context:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_BROWSER_CONTEXTS.map((ctx) => {
                const isSelected = ctx.id === selectedCtxId;
                return (
                  <button
                    key={ctx.id}
                    type="button"
                    onClick={() => setSelectedCtxId(ctx.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{ctx.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-100 flex items-center justify-between">
                        <span>{ctx.shortLabel}</span>
                        {isSelected && <Check size={14} className="text-purple-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{ctx.os}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleRandomize}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} /> Auto-Randomize Identity
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <ShieldCheck size={16} /> Apply Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
