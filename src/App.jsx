import React, { useState, useEffect, useRef } from 'react';
import HeaderControls from './components/HeaderControls';
import MultiViewGrid from './components/MultiViewGrid';
import BulkImportModal from './components/BulkImportModal';
import SessionConfigBar from './components/SessionConfigBar';
import MasterTimerBanner from './components/MasterTimerBanner';
import { PRESET_WORKSPACES, processUrl } from './utils/urlHelper';
import { fetchChannelCatalog, selectRandomNextVideo } from './services/youtubeCatalog';

const LOCAL_STORAGE_SAVED = 'omniview_saved_workspaces_v1';
const LOCAL_STORAGE_CURRENT = 'omniview_current_session_v1';

import { createSubBrowserIdentity, getRandomSubBrowserIdentity } from './utils/contextHelper';
import { getRandomWatchThreshold, getStaggeredLaunchDelayMs } from './utils/behaviorSimulator';

const DEFAULT_INITIAL_TABS = [
  {
    id: 'tab-init-1',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    title: 'Lofi Girl - 24/7 Chill Beats',
    isMuted: false,
    volume: 0.8,
    mode: 'auto',
    zoom: 100,
    refreshKey: 1,
    ...createSubBrowserIdentity(0)
  },
  {
    id: 'tab-init-2',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    title: 'Chillhop Radio - Live Stream',
    isMuted: true,
    volume: 0.5,
    mode: 'auto',
    zoom: 100,
    refreshKey: 1,
    ...createSubBrowserIdentity(1)
  },
  {
    id: 'tab-init-3',
    url: 'https://www.youtube.com/watch?v=BHACKCNDMW8',
    title: '4K Tropical Coral Reef Aquarium',
    isMuted: true,
    volume: 0.5,
    mode: 'auto',
    zoom: 100,
    refreshKey: 1,
    ...createSubBrowserIdentity(2)
  },
  {
    id: 'tab-init-4',
    url: 'https://www.youtube.com/watch?v=P9C25Un7qpY',
    title: 'NASA Live - Space Station Stream',
    isMuted: true,
    volume: 0.5,
    mode: 'auto',
    zoom: 100,
    refreshKey: 1,
    ...createSubBrowserIdentity(3)
  }
];

export default function App() {
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_INITIAL_TABS;
  });

  const [layout, setLayout] = useState('2x2');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [soloTabId, setSoloTabId] = useState(null);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);

  // SESSION STATE MANAGEMENT
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isFetchingChannel, setIsFetchingChannel] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(0);
  const [sessionTotalSeconds, setSessionTotalSeconds] = useState(0);
  const [channelCatalog, setChannelCatalog] = useState(null);
  const [totalVideosPlayed, setTotalVideosPlayed] = useState(0);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [activeSessionConfig, setActiveSessionConfig] = useState(null);

  const [savedWorkspaces, setSavedWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save current freeform tabs to localStorage when not in channel session mode
  useEffect(() => {
    if (!isSessionActive && !isSessionMode) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CURRENT, JSON.stringify(tabs));
      } catch {}
    }
  }, [tabs, isSessionActive, isSessionMode]);

  // Master Session Timer Interval
  useEffect(() => {
    let timerId = null;
    if (isSessionActive && sessionRemainingSeconds > 0) {
      timerId = setInterval(() => {
        setSessionRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setIsSessionActive(false);
            setIsSessionCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isSessionActive, sessionRemainingSeconds]);

  // START CONTINUOUS CHANNEL SESSION
  const handleStartSession = async (config) => {
    setIsFetchingChannel(true);
    setSessionError(null);

    try {
      const catalog = await fetchChannelCatalog(config.channelUrl);
      if (!catalog.videos || catalog.videos.length === 0) {
        throw new Error('No public video IDs found on this YouTube channel.');
      }

      setChannelCatalog(catalog);
      setActiveSessionConfig(config);

      const count = config.browserCount;
      const useBehaviorSim = config.enableBehaviorSimulation !== false;
      const initialTabs = [];

      for (let i = 0; i < count; i++) {
        // Pick an initial random video from catalog
        const nextVid = selectRandomNextVideo(catalog, []);
        const identity = createSubBrowserIdentity(i);
        const watchTargetPercent = useBehaviorSim ? getRandomWatchThreshold(52, 86) : 100;
        const staggerDelayMs = (useBehaviorSim && i > 0) ? getStaggeredLaunchDelayMs(i) : 0;

        initialTabs.push({
          id: `sub-browser-${i + 1}`,
          browserIndex: i + 1,
          browserLabel: `BROWSER ${i + 1}`,
          videoId: nextVid.id,
          url: `https://www.youtube.com/watch?v=${nextVid.id}`,
          title: nextVid.title,
          history: [{ id: nextVid.id, title: nextVid.title }],
          isSessionPane: true,
          isMuted: i > 0, // first browser unmuted, rest muted by default
          volume: masterVolume,
          mode: 'auto',
          zoom: 100,
          refreshKey: 1,
          location: identity.location,
          context: identity.context,
          sessionId: identity.sessionId,
          watchTargetPercent,
          staggerDelayMs
        });
      }

      // Auto choose layout based on browser count
      let chosenLayout = '2x2';
      if (count === 1) chosenLayout = '1x1';
      else if (count === 2) chosenLayout = 'flex';
      else if (count <= 4) chosenLayout = '2x2';
      else if (count <= 9) chosenLayout = '3x3';
      else if (count <= 16) chosenLayout = '4x4';

      setTabs(initialTabs);
      setLayout(chosenLayout);
      setTotalVideosPlayed(count);
      setSessionTotalSeconds(config.durationSeconds);
      setSessionRemainingSeconds(config.durationSeconds);
      setIsSessionMode(true);
      setIsSessionActive(true);
      setIsSessionCompleted(false);
      setSoloTabId(null);
    } catch (err) {
      setSessionError(err.message || 'Failed to initialize channel session.');
    } finally {
      setIsFetchingChannel(false);
    }
  };

  // STOP SESSION
  const handleStopSession = () => {
    setIsSessionActive(false);
  };

  // RESET SESSION BACK TO FREEFORM MULTI-VIEW BROWSER
  const handleResetSession = () => {
    setIsSessionActive(false);
    setIsSessionMode(false);
    setIsSessionCompleted(false);
    setTabs(DEFAULT_INITIAL_TABS);
    setLayout('2x2');
  };

  // RESTART CURRENT SESSION
  const handleRestartSession = () => {
    if (activeSessionConfig) {
      handleStartSession(activeSessionConfig);
    }
  };

  // AUTOMATIC NEXT VIDEO & IDENTITY ROTATION TRIGGER WHEN A SUB-BROWSER FINISHES A VIDEO
  const handleVideoEnded = (tabId) => {
    if (!channelCatalog) return;

    setTabs(prevTabs => {
      return prevTabs.map(tab => {
        if (tab.id === tabId) {
          const playedIds = (tab.history || []).map(h => h.id);
          const nextVid = selectRandomNextVideo(channelCatalog, playedIds);
          if (!nextVid) return tab;

          // Generate fresh location, IP, user-agent context, isolated session ID & randomized watch target
          const newIdentity = getRandomSubBrowserIdentity(tab.location?.id, tab.context?.id);
          const newWatchTargetPercent = getRandomWatchThreshold(52, 86);
          const updatedHistory = [...(tab.history || []), { id: nextVid.id, title: nextVid.title }];

          console.log(`[Auto-Next & Geo-Rotation & Behavior Sim] Sub-Browser ${tab.browserIndex || tab.id} completed video!`, {
            nextVideo: `${nextVid.title} (${nextVid.id})`,
            newLocation: `${newIdentity.location.flag} ${newIdentity.location.city} (${newIdentity.location.ip})`,
            newContext: `${newIdentity.context.shortLabel}`,
            newWatchTarget: `${newWatchTargetPercent}%`
          });

          return {
            ...tab,
            videoId: nextVid.id,
            url: `https://www.youtube.com/watch?v=${nextVid.id}`,
            title: nextVid.title,
            history: updatedHistory,
            location: newIdentity.location,
            context: newIdentity.context,
            sessionId: newIdentity.sessionId,
            watchTargetPercent: newWatchTargetPercent,
            staggerDelayMs: 0,
            refreshKey: (tab.refreshKey || 0) + 1
          };
        }
        return tab;
      });
    });

    setTotalVideosPlayed(prev => prev + 1);
  };

  // Add a single sub-tab (Freeform Mode)
  const handleAddTab = (initialUrl = '', initialTitle = '') => {
    const newId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const info = processUrl(initialUrl);
    const identity = createSubBrowserIdentity(tabs.length);
    const newTab = {
      id: newId,
      url: initialUrl,
      title: initialTitle || info.provider || `Sub-Tab #${tabs.length + 1}`,
      isMuted: tabs.length > 0,
      volume: masterVolume,
      mode: 'auto',
      zoom: 100,
      refreshKey: 1,
      location: identity.location,
      context: identity.context,
      sessionId: identity.sessionId
    };
    setTabs(prev => [...prev, newTab]);
  };

  // Update specific sub-tab properties
  const handleUpdateTab = (id, changes) => {
    setTabs(prev =>
      prev.map(tab => (tab.id === id ? { ...tab, ...changes } : tab))
    );
  };

  // Remove a sub-tab
  const handleRemoveTab = (id) => {
    setTabs(prev => prev.filter(tab => tab.id !== id));
    if (soloTabId === id) {
      setSoloTabId(null);
    }
  };

  // Toggle Solo Audio Mode
  const handleSoloTab = (id) => {
    if (soloTabId === id) {
      setSoloTabId(null);
    } else {
      setSoloTabId(id);
    }
  };

  const handleMuteAll = () => {
    setTabs(prev => prev.map(t => ({ ...t, isMuted: true })));
    setIsAllMuted(true);
    setSoloTabId(null);
  };

  const handleUnmuteAll = () => {
    setTabs(prev => prev.map(t => ({ ...t, isMuted: false })));
    setIsAllMuted(false);
  };

  const handleMasterVolumeChange = (newVol) => {
    setMasterVolume(newVol);
    setTabs(prev => prev.map(t => ({ ...t, volume: newVol })));
  };

  const handleReloadAll = () => {
    setTabs(prev =>
      prev.map(t => ({ ...t, refreshKey: (t.refreshKey || 0) + 1 }))
    );
  };

  const handleImportLinks = (urls, importMode) => {
    const newTabs = urls.map((url, idx) => {
      const info = processUrl(url);
      const identity = createSubBrowserIdentity(importMode === 'replace' ? idx : tabs.length + idx);
      return {
        id: `tab-bulk-${Date.now()}-${idx}`,
        url,
        title: info.provider || `View ${idx + 1}`,
        isMuted: idx > 0,
        volume: masterVolume,
        mode: 'auto',
        zoom: 100,
        refreshKey: 1,
        location: identity.location,
        context: identity.context,
        sessionId: identity.sessionId
      };
    });

    if (importMode === 'replace') {
      setTabs(newTabs);
      setIsSessionMode(false);
      setIsSessionActive(false);
    } else {
      setTabs(prev => [...prev, ...newTabs]);
    }
    setSoloTabId(null);
  };

  const handleLoadWorkspace = (ws) => {
    if (ws.tabs && Array.isArray(ws.tabs)) {
      const loaded = ws.tabs.map((t, i) => {
        const identity = createSubBrowserIdentity(i);
        return {
          id: `tab-ws-${Date.now()}-${i}`,
          url: t.url,
          title: t.title || 'Loaded View',
          isMuted: t.isMuted !== undefined ? t.isMuted : i > 0,
          volume: t.volume !== undefined ? t.volume : masterVolume,
          mode: t.mode || 'auto',
          zoom: 100,
          refreshKey: 1,
          location: t.location || identity.location,
          context: t.context || identity.context,
          sessionId: t.sessionId || identity.sessionId
        };
      });
      setTabs(loaded);
      if (ws.layout) {
        setLayout(ws.layout);
      }
      setIsSessionActive(false);
      setIsSessionMode(false);
      setSoloTabId(null);
    }
  };

  const handleSaveWorkspace = (name) => {
    const newWs = {
      id: `user-ws-${Date.now()}`,
      name,
      layout,
      tabs: tabs.map(t => ({
        url: t.url,
        title: t.title,
        isMuted: t.isMuted,
        volume: t.volume,
        mode: t.mode
      }))
    };
    setSavedWorkspaces(prev => [...prev, newWs]);
  };

  const handleDeleteWorkspace = (id) => {
    setSavedWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  const handleClearAllTabs = () => {
    setTabs([]);
    setSoloTabId(null);
    setIsSessionActive(false);
    setIsSessionMode(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Application Navigation Header */}
      <HeaderControls
        tabsCount={tabs.length}
        layout={layout}
        onLayoutChange={setLayout}
        onAddTab={() => handleAddTab()}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onMuteAll={handleMuteAll}
        onUnmuteAll={handleUnmuteAll}
        isAllMuted={isAllMuted}
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolumeChange}
        onReloadAll={handleReloadAll}
        onLoadWorkspace={handleLoadWorkspace}
        onSaveWorkspace={handleSaveWorkspace}
        savedWorkspaces={savedWorkspaces}
        onDeleteWorkspace={handleDeleteWorkspace}
        onClearAllTabs={handleClearAllTabs}
      />

      {/* Channel Session Configuration Bar */}
      <SessionConfigBar
        isSessionActive={isSessionActive}
        isFetchingChannel={isFetchingChannel}
        onStartSession={handleStartSession}
        onStopSession={handleStopSession}
        sessionError={sessionError}
      />

      {/* Master Countdown Timer Banner (shown when session is active or completed) */}
      {(isSessionActive || isSessionCompleted) && (
        <MasterTimerBanner
          remainingSeconds={sessionRemainingSeconds}
          totalSeconds={sessionTotalSeconds}
          channelTitle={channelCatalog?.channelTitle || 'Channel Session'}
          browserCount={tabs.length}
          totalVideosPlayed={totalVideosPlayed}
          isCompleted={isSessionCompleted}
          onRestartSession={handleRestartSession}
          onResetSession={handleResetSession}
        />
      )}

      {/* Main Multi-View Grid */}
      <MultiViewGrid
        tabs={tabs}
        layout={layout}
        onUpdateTab={handleUpdateTab}
        onRemoveTab={handleRemoveTab}
        onAddTab={() => handleAddTab()}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        soloTabId={soloTabId}
        onSoloTab={handleSoloTab}
        onVideoEnded={handleVideoEnded}
        isSessionActive={isSessionActive}
      />

      {/* Bulk Link Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportLinks={handleImportLinks}
      />
    </div>
  );
}
