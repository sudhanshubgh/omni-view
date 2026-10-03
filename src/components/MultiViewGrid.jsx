import React from 'react';
import SubTabPane from './SubTabPane';
import YouTubePlayerPane from './YouTubePlayerPane';
import { Plus, Globe, Layers } from 'lucide-react';

export default function MultiViewGrid({
  tabs,
  layout,
  onUpdateTab,
  onRemoveTab,
  onAddTab,
  onOpenBulkModal,
  soloTabId,
  onSoloTab,
  onVideoEnded,
  isSessionActive
}) {
  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/80">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-bounce">
          <Layers size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-100 mb-2 tracking-tight">
          Welcome to OmniView Multi-Tab Studio
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          Create any number of sub-tabs, all running concurrently in active mode. Or launch a Continuous Channel Session above!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onAddTab}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-xl transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Sub-Tab
          </button>
          <button
            onClick={onOpenBulkModal}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-sm font-bold border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Layers size={18} /> Bulk Add Links
          </button>
        </div>
      </div>
    );
  }

  // Calculate CSS grid classes based on layout & tab count
  const getGridStyle = () => {
    switch (layout) {
      case '1x1':
        return 'grid grid-cols-1 grid-rows-1';
      case '2x2':
        return 'grid grid-cols-1 md:grid-cols-2 grid-rows-2';
      case '3x3':
        return 'grid grid-cols-1 md:grid-cols-3 grid-rows-3';
      case '4x4':
        return 'grid grid-cols-2 md:grid-cols-4 grid-rows-4';
      case '1+3':
        return 'layout-1-plus-3';
      case 'flex':
      default:
        if (tabs.length === 1) return 'grid grid-cols-1';
        if (tabs.length === 2) return 'grid grid-cols-1 md:grid-cols-2';
        if (tabs.length <= 4) return 'grid grid-cols-1 md:grid-cols-2';
        if (tabs.length <= 6) return 'grid grid-cols-1 md:grid-cols-3';
        if (tabs.length <= 9) return 'grid grid-cols-1 md:grid-cols-3';
        return 'grid grid-cols-2 md:grid-cols-4';
    }
  };

  const renderPane = (tab) => {
    if (tab.isSessionPane || (isSessionActive && tab.videoId)) {
      return (
        <YouTubePlayerPane
          tab={tab}
          onVideoEnded={onVideoEnded}
          onUpdateTab={onUpdateTab}
          onRemoveTab={onRemoveTab}
          onSoloTab={onSoloTab}
          isSoloed={soloTabId === tab.id}
          hasActiveSolo={Boolean(soloTabId)}
          isSessionActive={isSessionActive}
        />
      );
    }
    return (
      <SubTabPane
        tab={tab}
        onUpdateTab={onUpdateTab}
        onRemoveTab={onRemoveTab}
        onSoloTab={onSoloTab}
        isSoloed={soloTabId === tab.id}
        hasActiveSolo={Boolean(soloTabId)}
      />
    );
  };

  if (layout === '1+3') {
    const mainTab = tabs[0];
    const sideTabs = tabs.slice(1);

    return (
      <div className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-4 gap-3 bg-slate-950 overflow-auto">
        <div className="lg:col-span-3 h-[450px] lg:h-full">
          {mainTab && renderPane(mainTab)}
        </div>

        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
          {sideTabs.map((tab) => (
            <div key={tab.id} className="h-64 shrink-0">
              {renderPane(tab)}
            </div>
          ))}

          {!isSessionActive && (
            <button
              onClick={onAddTab}
              className="h-28 rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-400 transition-all shrink-0 gap-1 group"
            >
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Add Side View</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-3 gap-3 bg-slate-950 overflow-y-auto ${getGridStyle()}`}>
      {tabs.map((tab) => (
        <div key={tab.id} className="w-full min-h-[300px] h-full">
          {renderPane(tab)}
        </div>
      ))}
    </div>
  );
}
