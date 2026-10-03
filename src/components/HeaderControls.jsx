import React, { useState } from 'react';
import { 
  Tv, Plus, Layers, Grid2X2, Grid3X3, LayoutGrid, Volume2, VolumeX, 
  RefreshCw, Bookmark, Maximize, Play, Pause, ShieldCheck, Sparkles, Trash2, Save, Monitor
} from 'lucide-react';
import { PRESET_WORKSPACES } from '../utils/urlHelper';

export default function HeaderControls({
  tabsCount,
  layout,
  onLayoutChange,
  onAddTab,
  onOpenBulkModal,
  onMuteAll,
  onUnmuteAll,
  isAllMuted,
  masterVolume,
  onMasterVolumeChange,
  onReloadAll,
  onLoadWorkspace,
  onSaveWorkspace,
  savedWorkspaces,
  onDeleteWorkspace,
  onClearAllTabs
}) {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e?.preventDefault();
    if (newWorkspaceName.trim()) {
      onSaveWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setIsSaving(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      {/* BRAND & LOGO */}
      <div className="flex items-center gap-3">
        <div className="relative group flex items-center justify-center">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center border border-cyan-400/40 text-cyan-400">
            <Tv size={20} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              OMNIVIEW
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
              MULTI-TAB ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {tabsCount} Active {tabsCount === 1 ? 'Sub-Tab' : 'Sub-Tabs'} Playing Simultaneously
          </p>
        </div>
      </div>

      {/* MIDDLE: LAYOUT PRESETS & TAB ADDERS */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add View Buttons */}
        <button
          onClick={onAddTab}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 border border-cyan-400/30"
          title="Add a new sub-tab"
        >
          <Plus size={15} /> Add Sub-Tab
        </button>

        <button
          onClick={onOpenBulkModal}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          title="Paste multiple links at once"
        >
          <Layers size={14} className="text-cyan-400" /> Bulk Add Links
        </button>

        {/* Separator */}
        <div className="h-5 w-px bg-slate-800 mx-1"></div>

        {/* Layout Preset Buttons */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 gap-0.5">
          <button
            onClick={() => onLayoutChange('1x1')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              layout === '1x1' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Single Main View"
          >
            1x1
          </button>
          <button
            onClick={() => onLayoutChange('2x2')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              layout === '2x2' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Quad View (2x2 Grid)"
          >
            2x2
          </button>
          <button
            onClick={() => onLayoutChange('3x3')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              layout === '3x3' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="9 Views (3x3 Grid)"
          >
            3x3
          </button>
          <button
            onClick={() => onLayoutChange('4x4')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              layout === '4x4' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="16 Views (4x4 Grid)"
          >
            4x4
          </button>
          <button
            onClick={() => onLayoutChange('1+3')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              layout === '1+3' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="1 Big + 3 Side Views"
          >
            1+3
          </button>
          <button
            onClick={() => onLayoutChange('flex')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              layout === 'flex' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Auto-Fitting Responsive Wall"
          >
            Auto Wall
          </button>
        </div>
      </div>

      {/* RIGHT: AUDIO & WORKSPACE PRESETS */}
      <div className="flex items-center gap-2">
        {/* Master Mute / Volume */}
        <div className="flex items-center bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800 gap-2">
          <button
            onClick={isAllMuted ? onUnmuteAll : onMuteAll}
            className={`p-1 rounded transition-colors ${
              isAllMuted ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
            }`}
            title={isAllMuted ? 'Unmute All Sub-Tabs' : 'Mute All Sub-Tabs'}
          >
            {isAllMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400">Master</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 accent-cyan-400 bg-slate-800 rounded appearance-none cursor-pointer"
              title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
            />
          </div>
        </div>

        {/* Refresh All */}
        <button
          onClick={onReloadAll}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg border border-slate-800 transition-colors"
          title="Reload All Sub-Tabs"
        >
          <RefreshCw size={15} />
        </button>

        {/* Saved Workspaces Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Bookmark size={14} /> Presets & Saved
          </button>

          {showWorkspaceMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-200">Preset Workspaces</span>
                <button
                  onClick={() => setIsSaving(!isSaving)}
                  className="text-[11px] text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Save size={11} /> Save Current
                </button>
              </div>

              {/* Save Form */}
              {isSaving && (
                <form onSubmit={handleSave} className="mb-3 p-2 bg-slate-950 rounded-lg border border-cyan-500/40">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace Name (e.g. My Wall)"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 placeholder-slate-500 mb-2 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setIsSaving(false)}
                      className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-0.5 bg-cyan-600 text-white font-bold rounded text-[10px]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Default Presets */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block px-1">Built-in Bundles</span>
                {PRESET_WORKSPACES.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onLoadWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">{ws.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{ws.description}</div>
                  </button>
                ))}
              </div>

              {/* User Saved Workspaces */}
              {savedWorkspaces.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-800 pt-2">
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block px-1">Your Workspaces</span>
                  {savedWorkspaces.map((ws) => (
                    <div key={ws.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/90 border border-amber-500/20">
                      <button
                        onClick={() => {
                          onLoadWorkspace(ws);
                          setShowWorkspaceMenu(false);
                        }}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="text-xs font-bold text-amber-200 truncate">{ws.name}</div>
                        <div className="text-[10px] text-slate-400">{ws.tabs.length} tabs</div>
                      </button>
                      <button
                        onClick={() => onDeleteWorkspace(ws.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete saved workspace"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear All */}
        <button
          onClick={onClearAllTabs}
          className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition-colors"
          title="Clear all tabs"
        >
          <Trash2 size={15} />
        </button>

        {/* Fullscreen Full Dashboard */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg border border-slate-800 transition-colors"
          title="Toggle Fullscreen Multi-View Dashboard"
        >
          <Monitor size={15} />
        </button>
      </div>
    </header>
  );
}
