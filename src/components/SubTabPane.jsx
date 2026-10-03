import React, { useState, useRef } from 'react';
import { 
  Volume2, VolumeX, RefreshCw, ExternalLink, Maximize2, X, 
  Globe, Shield, Play, Edit3, Check, Radio
} from 'lucide-react';
import { processUrl } from '../utils/urlHelper';
import ContextLocationModal from './ContextLocationModal';
import { PRESET_LOCATIONS, PRESET_BROWSER_CONTEXTS } from '../utils/contextHelper';

export default function SubTabPane({
  tab,
  onUpdateTab,
  onRemoveTab,
  onSoloTab,
  isSoloed,
  hasActiveSolo
}) {
  const [isEditingUrl, setIsEditingUrl] = useState(!tab.url);
  const [tempUrl, setTempUrl] = useState(tab.url || '');
  const [tempTitle, setTempTitle] = useState(tab.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const iframeRef = useRef(null);
  const videoRef = useRef(null);

  // Effective mute state: if another pane is soloed and this is NOT soloed, mute this pane!
  const effectiveMute = hasActiveSolo ? !isSoloed : tab.isMuted;

  const currentLoc = tab.location || PRESET_LOCATIONS[0];
  const currentCtx = tab.context || PRESET_BROWSER_CONTEXTS[0];

  const processed = processUrl(tab.url, {
    isMuted: effectiveMute,
    mode: tab.mode || 'auto',
    proxyPort: 3001,
    location: currentLoc,
    context: currentCtx
  });

  const handleUrlSubmit = (e) => {
    e?.preventDefault();
    let finalUrl = tempUrl.trim();
    if (finalUrl) {
      const info = processUrl(finalUrl, { isMuted: effectiveMute, mode: tab.mode, location: currentLoc, context: currentCtx });
      onUpdateTab(tab.id, {
        url: finalUrl,
        title: tempTitle.trim() || info.provider || 'Active View',
        refreshKey: (tab.refreshKey || 0) + 1
      });
      setIsEditingUrl(false);
    }
  };

  const handleTitleSubmit = (e) => {
    e?.preventDefault();
    if (tempTitle.trim()) {
      onUpdateTab(tab.id, { title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const toggleMute = () => {
    onUpdateTab(tab.id, { isMuted: !tab.isMuted });
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    onUpdateTab(tab.id, { volume: newVol, isMuted: newVol === 0 });
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
  };

  const toggleMode = () => {
    const nextMode = tab.mode === 'proxy' ? 'auto' : 'proxy';
    onUpdateTab(tab.id, { mode: nextMode, refreshKey: (tab.refreshKey || 0) + 1 });
  };

  const handleReload = () => {
    onUpdateTab(tab.id, { refreshKey: (tab.refreshKey || 0) + 1 });
  };

  const cycleZoom = () => {
    const zoomLevels = [100, 80, 60, 120, 150];
    const currentIndex = zoomLevels.indexOf(tab.zoom || 100);
    const nextZoom = zoomLevels[(currentIndex + 1) % zoomLevels.length];
    onUpdateTab(tab.id, { zoom: nextZoom });
  };

  const openExternal = () => {
    if (tab.url) {
      window.open(tab.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFullscreenPane = () => {
    const container = document.getElementById(`pane-container-${tab.id}`);
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  return (
    <div
      id={`pane-container-${tab.id}`}
      className={`relative flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 border ${
        isSoloed
          ? 'ring-2 ring-amber-400 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
          : effectiveMute
          ? 'border-slate-800 bg-slate-900/90 shadow-lg'
          : 'border-cyan-500/30 bg-slate-900/95 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-500/60'
      }`}
    >
      {/* PANE HEADER BAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 select-none text-xs gap-2">
        {/* Left: Active Indicator & Title / URL input */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isSoloed ? 'bg-amber-400' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isSoloed ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
          </span>

          {/* Provider Badge */}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0 uppercase tracking-wider">
            {processed.provider || 'WEB'}
          </span>

          {/* Editable Title */}
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="View Title"
                className="w-full bg-slate-900 border border-cyan-500/60 rounded px-2 py-0.5 text-xs text-slate-100 focus:outline-none"
                autoFocus
              />
              <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-0.5">
                <Check size={14} />
              </button>
            </form>
          ) : (
            <div 
              className="flex items-center gap-1.5 truncate font-medium text-slate-200 cursor-pointer hover:text-cyan-400 flex-1"
              onDoubleClick={() => {
                setTempTitle(tab.title || processed.provider || '');
                setIsEditingTitle(true);
              }}
              title="Double click to edit view title"
            >
              <span className="truncate">{tab.title || processed.provider || 'Active Pane'}</span>
              <button 
                onClick={() => {
                  setTempTitle(tab.title || processed.provider || '');
                  setIsEditingTitle(true);
                }} 
                className="opacity-0 hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
              >
                <Edit3 size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {/* Identity & Location Badge Trigger */}
          <button
            onClick={() => setIsContextModalOpen(true)}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-cyan-700/40 flex items-center gap-1 transition-all"
            title="Configure Sub-Browser Identity, Location & User Agent"
          >
            <span>{currentLoc.flag}</span>
            <span className="truncate max-w-[80px] hidden sm:inline">{currentLoc.code}</span>
            <span className="text-slate-500">|</span>
            <span>{currentCtx.icon}</span>
          </button>

          {/* Solo Button */}
          <button
            onClick={() => onSoloTab(tab.id)}
            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              isSoloed
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400'
            }`}
            title="Solo Audio: Mute all other panes and focus audio on this tab"
          >
            <Radio size={12} className={isSoloed ? 'animate-pulse' : ''} />
            {isSoloed ? 'SOLO ACTIVE' : 'SOLO'}
          </button>

          {/* Mute/Unmute */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
            <button
              onClick={toggleMute}
              className={`p-1 rounded transition-colors ${
                effectiveMute
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
              title={effectiveMute ? 'Unmute Pane' : 'Mute Pane'}
            >
              {effectiveMute ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={tab.volume !== undefined ? tab.volume : 0.8}
              onChange={handleVolumeChange}
              className="w-12 h-1 accent-cyan-400 bg-slate-800 rounded appearance-none cursor-pointer"
              title={`Volume: ${Math.round((tab.volume !== undefined ? tab.volume : 0.8) * 100)}%`}
            />
          </div>

          {/* Proxy Mode Toggle */}
          <button
            onClick={toggleMode}
            className={`p-1.5 rounded transition-colors ${
              tab.mode === 'proxy'
                ? 'bg-purple-950 text-purple-400 border border-purple-600/50'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={tab.mode === 'proxy' ? 'CORS Proxy Active with Custom Geo-IP/UA (Click to switch to Direct)' : 'Direct Mode (Click to enable Proxy with Geo-IP & User-Agent spoofing)'}
          >
            <Shield size={13} />
          </button>

          {/* Change URL */}
          <button
            onClick={() => {
              setTempUrl(tab.url || '');
              setIsEditingUrl(!isEditingUrl);
            }}
            className={`p-1.5 rounded transition-colors ${
              isEditingUrl ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Edit Link / Change URL"
          >
            <Globe size={13} />
          </button>

          {/* Zoom Toggle */}
          <button
            onClick={cycleZoom}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title={`Zoom: ${tab.zoom || 100}%`}
          >
            <span className="text-[10px] font-mono font-bold">{tab.zoom || 100}%</span>
          </button>

          {/* Refresh */}
          <button
            onClick={handleReload}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reload Sub-Tab"
          >
            <RefreshCw size={13} />
          </button>

          {/* External Window */}
          <button
            onClick={openExternal}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Open in new browser tab"
          >
            <ExternalLink size={13} />
          </button>

          {/* Fullscreen Pane */}
          <button
            onClick={handleFullscreenPane}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Fullscreen Pane"
          >
            <Maximize2 size={13} />
          </button>

          {/* Close Tab */}
          <button
            onClick={() => onRemoveTab(tab.id)}
            className="p-1.5 rounded hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors ml-0.5"
            title="Close Sub-Tab"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* URL EDIT INLINE POPUP */}
      {isEditingUrl && (
        <form 
          onSubmit={handleUrlSubmit} 
          className="bg-slate-950/95 border-b border-cyan-500/40 p-2 flex items-center gap-2 z-20 shadow-xl"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="Paste any link (YouTube, Twitch, Video URL, Web Page...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shrink-0 flex items-center gap-1"
          >
            <Play size={12} /> Load Link
          </button>
          <button
            type="button"
            onClick={() => setIsEditingUrl(false)}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* VIEWPORT CONTENT */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {!tab.url || processed.type === 'empty' ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
              <Globe size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">Sub-Tab Active & Ready</h4>
            <p className="text-xs text-slate-400 mb-4">Paste any link above to start playing simultaneously.</p>
            <button
              onClick={() => setIsEditingUrl(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center gap-2"
            >
              <Edit3 size={14} /> Paste Link
            </button>
          </div>
        ) : processed.type === 'direct-media' ? (
          /* HTML5 Video / Audio Player */
          <video
            ref={videoRef}
            key={`video-${tab.refreshKey || 0}`}
            src={processed.url}
            controls
            autoPlay
            loop
            muted={effectiveMute}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          /* Iframe View (YouTube, Twitch, Web, Proxy) */
          <div 
            className="w-full h-full origin-top-left transition-transform duration-200 overflow-hidden"
            style={{
              transform: tab.zoom && tab.zoom !== 100 ? `scale(${tab.zoom / 100})` : 'none',
              width: tab.zoom && tab.zoom !== 100 ? `${(100 / tab.zoom) * 100}%` : '100%',
              height: tab.zoom && tab.zoom !== 100 ? `${(100 / tab.zoom) * 100}%` : '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              key={`iframe-${tab.id}-${tab.refreshKey || 0}-${tab.mode || 'auto'}`}
              src={processed.url}
              title={tab.title || 'OmniView Sub-Tab'}
              className="w-full h-full border-0 bg-slate-950"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; microphone; camera; fullscreen"
              allowFullScreen
              sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
            />
          </div>
        )}

        {/* Solo Audio Overlay Indicator */}
        {isSoloed && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded shadow-lg pointer-events-none flex items-center gap-1 z-10 border border-amber-300">
            <Radio size={12} className="animate-spin" /> AUDIO SOLO ACTIVE
          </div>
        )}
      </div>

      {/* FOOTER IDENTITY & LOCATION STATUS BAR */}
      <div className="px-3 py-1 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={() => setIsContextModalOpen(true)}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors truncate"
          title="Click to customize Location, IP & Browser Context"
        >
          <span className="font-bold">{currentLoc.flag} {currentLoc.city}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[10px]">{currentLoc.ip}</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400 font-semibold">{currentCtx.shortLabel}</span>
        </button>
        <span className="font-mono text-[10px] text-slate-500 shrink-0">
          Mode: {tab.mode === 'proxy' ? 'Proxy (Spoofed)' : 'Direct'}
        </span>
      </div>

      {/* Context & Location Settings Modal */}
      <ContextLocationModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        tab={tab}
        onApplyIdentity={onUpdateTab}
      />
    </div>
  );
}

