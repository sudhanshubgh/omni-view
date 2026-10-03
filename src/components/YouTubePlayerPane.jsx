import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, RefreshCw, Volume2, VolumeX, Radio, AlertTriangle, 
  Clock, SkipForward, History
} from 'lucide-react';
import ContextLocationModal from './ContextLocationModal';
import { PRESET_LOCATIONS, PRESET_BROWSER_CONTEXTS, getRandomSubBrowserIdentity } from '../utils/contextHelper';
import { 
  getRandomWatchThreshold, 
  generateInteractivityJitter, 
  getMidSessionRotationIntervalMs 
} from '../utils/behaviorSimulator';

// Global YouTube API Ready Promise Loader
let ytApiPromise = null;
function loadYouTubeIframeApi() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }
  ytApiPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('yt-iframe-api-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'yt-iframe-api-script';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      resolve(window.YT);
    };
  });
  return ytApiPromise;
}

export default function YouTubePlayerPane({
  tab,
  onVideoEnded,
  onUpdateTab,
  onRemoveTab,
  onSoloTab,
  isSoloed,
  hasActiveSolo,
  isSessionActive
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const hasTriggeredNextRef = useRef(false);
  const [playerState, setPlayerState] = useState('loading'); // 'playing', 'paused', 'ended', 'loading', 'error', 'staggered'
  const [videoTitle, setVideoTitle] = useState(tab.title || 'Loading Video...');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [staggerRemainingSeconds, setStaggerRemainingSeconds] = useState(0);
  const [activeJitterMessage, setActiveJitterMessage] = useState(null);

  const effectiveMute = hasActiveSolo ? !isSoloed : tab.isMuted;
  const currentLoc = tab.location || PRESET_LOCATIONS[0];
  const currentCtx = tab.context || PRESET_BROWSER_CONTEXTS[0];
  const targetWatchPercent = tab.watchTargetPercent || 72;

  // Reset completion trigger flag on video change
  useEffect(() => {
    hasTriggeredNextRef.current = false;
  }, [tab.videoId, tab.refreshKey]);

  // Mid-Session Identity Rotation Timer (rotates Location, IP & UA mid-session every ~90s to 150s)
  useEffect(() => {
    let rotationTimer = null;
    if (isSessionActive && playerState === 'playing') {
      const intervalMs = getMidSessionRotationIntervalMs(90, 150);
      rotationTimer = setInterval(() => {
        const newIdentity = getRandomSubBrowserIdentity(currentLoc.id, currentCtx.id);
        console.log(`[Mid-Session Geo-Lifecycle Rotation] SubBrowser ${tab.id} updating identity mid-stream:`, {
          newLocation: `${newIdentity.location.flag} ${newIdentity.location.city} (${newIdentity.location.ip})`,
          newContext: newIdentity.context.shortLabel
        });
        onUpdateTab(tab.id, {
          location: newIdentity.location,
          context: newIdentity.context,
          sessionId: newIdentity.sessionId
        });
        setActiveJitterMessage(`Mid-Session Identity Rotation → ${newIdentity.location.flag} ${newIdentity.location.code}`);
        setTimeout(() => setActiveJitterMessage(null), 3500);
      }, intervalMs);
    }
    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [tab.id, isSessionActive, playerState, currentLoc.id, currentCtx.id]);

  // Session Interactivity Jitter Loop (volume nudges, micro-pauses)
  useEffect(() => {
    let jitterInterval = null;
    if (isSessionActive && playerState === 'playing') {
      jitterInterval = setInterval(() => {
        const jitter = generateInteractivityJitter(tab.volume || 0.8);
        if (jitter.type === 'volume_nudge') {
          onUpdateTab(tab.id, { volume: jitter.newVolume });
          setActiveJitterMessage(`Interactivity Jitter: ${jitter.description}`);
          setTimeout(() => setActiveJitterMessage(null), 3000);
        } else if (jitter.type === 'pause_resume' && playerRef.current?.pauseVideo) {
          try {
            playerRef.current.pauseVideo();
            setPlayerState('paused');
            setActiveJitterMessage(`Interactivity Jitter: ${jitter.description}`);
            setTimeout(() => {
              if (playerRef.current?.playVideo) {
                playerRef.current.playVideo();
                setPlayerState('playing');
              }
              setActiveJitterMessage(null);
            }, jitter.pauseDurationMs);
          } catch {}
        }
      }, 30000);
    }
    return () => {
      if (jitterInterval) clearInterval(jitterInterval);
    };
  }, [tab.id, tab.volume, isSessionActive, playerState]);

  // Initialize YouTube Player Instance (with Staggered Startup Delay support)
  useEffect(() => {
    let isMounted = true;
    let timerId = null;
    let staggerTimeout = null;

    const delayMs = tab.staggerDelayMs || 0;
    if (delayMs > 0) {
      setPlayerState('staggered');
      setStaggerRemainingSeconds(Math.ceil(delayMs / 1000));

      const countdownInterval = setInterval(() => {
        setStaggerRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      staggerTimeout = setTimeout(() => {
        if (isMounted) initPlayer();
      }, delayMs);
    } else {
      initPlayer();
    }

    function initPlayer() {
      loadYouTubeIframeApi().then((YT) => {
        if (!isMounted || !containerRef.current) return;

        const elementId = `yt-player-element-${tab.id}`;
        // Clean previous container
        containerRef.current.innerHTML = `<div id="${elementId}" class="w-full h-full"></div>`;

        try {
          playerRef.current = new YT.Player(elementId, {
            height: '100%',
            width: '100%',
            videoId: tab.videoId || '',
            playerVars: {
              autoplay: 1,
              enablejsapi: 1,
              rel: 0,
              controls: 1,
              modestbranding: 1,
              playsinline: 1,
              mute: effectiveMute ? 1 : 0
            },
            events: {
              onReady: (event) => {
                if (!isMounted) return;
                if (effectiveMute) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                  if (tab.volume !== undefined) {
                    event.target.setVolume(Math.round(tab.volume * 100));
                  }
                }
                event.target.playVideo();
                setPlayerState('playing');

                // Start time & randomized watch percentage threshold tracking interval
                timerId = setInterval(() => {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const curr = playerRef.current.getCurrentTime() || 0;
                    const dur = playerRef.current.getDuration() || 0;
                    setCurrentTime(curr);
                    setDuration(dur);

                    // Update video title if player data available
                    const data = playerRef.current.getVideoData?.();
                    if (data && data.title && data.title !== videoTitle) {
                      setVideoTitle(data.title);
                    }

                    // RANDOMIZED WATCH DURATION THRESHOLD CHECK
                    if (dur > 15 && !hasTriggeredNextRef.current) {
                      const watchPercent = (curr / dur) * 100;
                      if (watchPercent >= targetWatchPercent) {
                        hasTriggeredNextRef.current = true;
                        console.log(`[Behavior Simulator] SubBrowser ${tab.id} reached randomized watch ratio (${watchPercent.toFixed(1)}% / ${targetWatchPercent}% target). Triggering next video...`);
                        onVideoEnded(tab.id);
                      }
                    }
                  }
                }, 1000);
              },
              onStateChange: (event) => {
                if (!isMounted) return;
                const YTState = YT.PlayerState;

                if (event.data === YTState.PLAYING) {
                  setPlayerState('playing');
                } else if (event.data === YTState.PAUSED) {
                  setPlayerState('paused');
                } else if (event.data === YTState.BUFFERING) {
                  setPlayerState('loading');
                } else if (event.data === YTState.ENDED) {
                  if (!hasTriggeredNextRef.current) {
                    hasTriggeredNextRef.current = true;
                    console.log(`[SubBrowser ${tab.id}] Video ended at 100%. Transitioning to next video...`);
                    setPlayerState('ended');
                    onVideoEnded(tab.id);
                  }
                }
              },
              onError: (errEvent) => {
                if (!isMounted) return;
                console.warn(`[SubBrowser ${tab.id}] Playback error code (${errEvent.data}). Skipping to next video in 2s...`);
                setPlayerState('error');
                setTimeout(() => {
                  if (isMounted && !hasTriggeredNextRef.current) {
                    hasTriggeredNextRef.current = true;
                    onVideoEnded(tab.id);
                  }
                }, 2000);
              }
            }
          });
        } catch (err) {
          console.error('YT.Player init error:', err);
        }
      });
    }

    return () => {
      isMounted = false;
      if (staggerTimeout) clearTimeout(staggerTimeout);
      if (timerId) clearInterval(timerId);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [tab.id, tab.videoId, tab.refreshKey, tab.staggerDelayMs]);

  // Handle Mute & Volume changes on active player instance
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.mute === 'function') {
      if (effectiveMute) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        if (tab.volume !== undefined) {
          playerRef.current.setVolume(Math.round(tab.volume * 100));
        }
      }
    }
  }, [effectiveMute, tab.volume]);

  const toggleMute = () => {
    onUpdateTab(tab.id, { isMuted: !tab.isMuted });
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    onUpdateTab(tab.id, { volume: newVol, isMuted: newVol === 0 });
  };

  const handleSkipNext = () => {
    onVideoEnded(tab.id);
  };

  const handleReload = () => {
    onUpdateTab(tab.id, { refreshKey: (tab.refreshKey || 0) + 1 });
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const historyList = tab.history || [];

  return (
    <div
      className={`relative flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 border ${
        isSoloed
          ? 'ring-2 ring-amber-400 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
          : effectiveMute
          ? 'border-slate-800 bg-slate-900/90 shadow-lg'
          : 'border-cyan-500/30 bg-slate-900/95 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-500/60'
      }`}
    >
      {/* PANE HEADER TELEMETRY BAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 select-none text-xs gap-2">
        {/* Sub-Browser Badge & Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-950 text-cyan-400 border border-cyan-700/50 uppercase tracking-widest shrink-0">
            {tab.browserLabel || `BROWSER ${tab.browserIndex || 1}`}
          </span>

          {/* Status Badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 ${
            playerState === 'playing'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
              : playerState === 'loading'
              ? 'bg-blue-950 text-blue-400 border border-blue-700/50 animate-pulse'
              : playerState === 'error'
              ? 'bg-rose-950 text-rose-400 border border-rose-700/50'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {playerState === 'playing' && <Play size={10} className="fill-emerald-400" />}
            {playerState === 'loading' && <Clock size={10} className="animate-spin" />}
            {playerState === 'error' && <AlertTriangle size={10} />}
            {playerState === 'playing' ? 'PLAYING' : playerState === 'loading' ? 'LOADING' : playerState === 'error' ? 'RETRYING' : 'ENDED'}
          </span>

          {/* Current Video Title */}
          <span className="truncate font-semibold text-slate-200 text-xs flex-1" title={videoTitle}>
            {videoTitle}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Identity / Location Badge Trigger */}
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
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400'
            }`}
            title="Solo Audio"
          >
            <Radio size={11} className={isSoloed ? 'animate-pulse' : ''} />
            {isSoloed ? 'SOLO' : 'SOLO'}
          </button>

          {/* Mute/Unmute */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <button
              onClick={toggleMute}
              className={`p-1 transition-colors ${
                effectiveMute ? 'text-rose-400' : 'text-emerald-400'
              }`}
              title={effectiveMute ? 'Unmute' : 'Mute'}
            >
              {effectiveMute ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={tab.volume !== undefined ? tab.volume : 0.8}
              onChange={handleVolumeChange}
              className="w-10 h-1 accent-cyan-400 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Skip Next Random Video & Rotate Identity */}
          <button
            onClick={handleSkipNext}
            className="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 rounded text-[10px] font-bold flex items-center gap-1 border border-cyan-500/30 transition-colors"
            title="Next Video from Channel (Rotates Location & IP)"
          >
            <SkipForward size={11} /> Next
          </button>

          {/* History Queue Modal Trigger */}
          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title={`Played History (${historyList.length} videos)`}
          >
            <History size={13} />
          </button>

          {/* Reload */}
          <button
            onClick={handleReload}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Reload Player"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* PLAYER CONTAINER */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />

        {/* Staggered Startup Delay Overlay */}
        {playerState === 'staggered' && (
          <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2 animate-spin">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-cyan-300">Staggered Launch Delay Active</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1">Starting playback in {staggerRemainingSeconds}s...</span>
          </div>
        )}

        {/* Live Interactivity Jitter Toast */}
        {activeJitterMessage && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500/95 text-slate-950 font-bold text-[10px] rounded shadow-lg z-20 animate-fadeIn border border-amber-300 flex items-center gap-1">
            <span>⚡</span>
            <span>{activeJitterMessage}</span>
          </div>
        )}

        {/* Live Remaining Time & Randomized Watch Target Badge */}
        {duration > 0 && (
          <>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-mono text-cyan-300 border border-slate-800 flex items-center gap-1.5 z-10 pointer-events-none">
              <Clock size={11} className="text-cyan-400" />
              <span>{formatSeconds(currentTime)} / {formatSeconds(duration)}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">-{formatSeconds(Math.max(0, duration - currentTime))}</span>
            </div>

            <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-mono text-purple-300 border border-slate-800 flex items-center gap-1 z-10 pointer-events-none">
              <span>🎯 Target: {targetWatchPercent}%</span>
            </div>
          </>
        )}

        {/* Solo Audio Overlay Indicator */}
        {isSoloed && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded shadow-lg pointer-events-none flex items-center gap-1 z-10 border border-amber-300">
            <Radio size={11} className="animate-spin" /> SOLO AUDIO
          </div>
        )}
      </div>

      {/* FOOTER HISTORY & TELEMETRY */}
      <div className="px-3 py-1.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 gap-2">
        <button
          onClick={() => setIsContextModalOpen(true)}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors truncate"
          title="Click to customize Location, IP & Browser Context"
        >
          <span className="font-bold text-slate-300">{currentLoc.flag} {currentLoc.city}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[10px]">{currentLoc.ip}</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400 font-semibold">{currentCtx.shortLabel}</span>
        </button>

        <span className="font-mono text-[10px] text-emerald-400 shrink-0">
          {historyList.length} played
        </span>
      </div>

      {/* History Drawer Modal */}
      {showHistoryModal && (
        <div className="absolute inset-0 bg-slate-950/95 z-30 p-4 flex flex-col gap-2 animate-fadeIn overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <History size={14} className="text-cyan-400" /> Sub-Browser History Chain
            </span>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No history recorded yet.</p>
            ) : (
              historyList.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">#{idx + 1}</span>
                    <span className="truncate text-slate-200">{item.title || item.id}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">{item.id}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
