import React, { useState } from 'react';
import { 
  Play, Square, Clock, Tv, Sparkles, Layers, AlertCircle, RefreshCw, Video
} from 'lucide-react';
import { SAMPLE_CHANNELS } from '../services/youtubeCatalog';

export default function SessionConfigBar({
  isSessionActive,
  isFetchingChannel,
  onStartSession,
  onStopSession,
  sessionError
}) {
  const [channelInput, setChannelInput] = useState('https://www.youtube.com/@LofiGirl');
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);
  const [subBrowserCount, setSubBrowserCount] = useState(6);
  const [enableBehaviorSimulation, setEnableBehaviorSimulation] = useState(true);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!channelInput.trim()) return;

    const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60;
    if (totalSeconds <= 0) {
      alert('Please enter a valid session duration (greater than 0 minutes).');
      return;
    }

    onStartSession({
      channelUrl: channelInput.trim(),
      durationSeconds: totalSeconds,
      browserCount: Math.min(16, Math.max(1, parseInt(subBrowserCount) || 4)),
      enableBehaviorSimulation
    });
  };

  return (
    <div className="bg-slate-950/95 border-b border-cyan-500/30 px-4 py-3 shadow-2xl relative z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Section Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Tv size={20} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              Continuous Channel Multi-Browser Session
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                Auto-Loop Mode
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Each sub-browser continuously plays random videos from the channel until session duration expires.
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 flex-1 justify-end">
          {/* Channel URL */}
          <div className="flex flex-col gap-1 flex-1 min-w-[240px]">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>YouTube Channel URL / Handle</span>
              <span className="text-cyan-400 font-normal">e.g. @LofiGirl</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="https://www.youtube.com/@ChannelName"
                disabled={isSessionActive || isFetchingChannel}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Quick Preset Channels */}
          <div className="flex items-center gap-1 self-end pb-0.5">
            {SAMPLE_CHANNELS.slice(0, 3).map((sc, i) => (
              <button
                key={i}
                type="button"
                disabled={isSessionActive || isFetchingChannel}
                onClick={() => setChannelInput(sc.handle)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
              >
                {sc.name}
              </button>
            ))}
          </div>

          {/* Session Duration (Hours & Minutes) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Session Duration
            </label>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
              <input
                type="number"
                min="0"
                max="72"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                disabled={isSessionActive || isFetchingChannel}
                className="w-10 bg-transparent text-center text-xs font-mono font-bold text-cyan-300 focus:outline-none disabled:opacity-60"
              />
              <span className="text-[11px] font-semibold text-slate-400">h</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                disabled={isSessionActive || isFetchingChannel}
                className="w-10 bg-transparent text-center text-xs font-mono font-bold text-cyan-300 focus:outline-none disabled:opacity-60"
              />
              <span className="text-[11px] font-semibold text-slate-400">m</span>
            </div>
          </div>

          {/* Simultaneous Sub-Browsers Count */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Sub-Browsers
            </label>
            <select
              value={subBrowserCount}
              onChange={(e) => setSubBrowserCount(parseInt(e.target.value))}
              disabled={isSessionActive || isFetchingChannel}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 rounded-lg px-2 py-1.5 focus:outline-none disabled:opacity-60 cursor-pointer"
            >
              <option value={1}>1 Browser</option>
              <option value={2}>2 Browsers</option>
              <option value={4}>4 Browsers (2x2)</option>
              <option value={6}>6 Browsers (3x2)</option>
              <option value={8}>8 Browsers (4x2)</option>
              <option value={9}>9 Browsers (3x3)</option>
              <option value={12}>12 Browsers (4x3)</option>
              <option value={16}>16 Browsers (4x4)</option>
            </select>
          </div>

          {/* Behavior Simulation Mode Toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-purple-400" /> Human Behavior
            </label>
            <button
              type="button"
              disabled={isSessionActive || isFetchingChannel}
              onClick={() => setEnableBehaviorSimulation(!enableBehaviorSimulation)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                enableBehaviorSimulation
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggles Randomized Watch %, Staggered Starts, Interactivity Jitter, and Mid-Session Geo Rotation"
            >
              <span>{enableBehaviorSimulation ? '🧠 Active' : 'Off'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end">
            {!isSessionActive ? (
              <button
                type="submit"
                disabled={isFetchingChannel}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 border border-cyan-400/30 disabled:opacity-50"
              >
                {isFetchingChannel ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-cyan-200" /> Fetching Catalog...
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-white" /> START SESSION
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopSession}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 border border-rose-400/30"
              >
                <Square size={14} className="fill-white" /> STOP SESSION
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {sessionError && (
        <div className="max-w-7xl mx-auto mt-2 p-2 bg-rose-950/80 border border-rose-600/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{sessionError}</span>
        </div>
      )}
    </div>
  );
}
