import React from 'react';
import { Clock, Play, Square, Tv, CheckCircle, RefreshCw, Layers } from 'lucide-react';

export default function MasterTimerBanner({
  remainingSeconds,
  totalSeconds,
  channelTitle,
  browserCount,
  totalVideosPlayed,
  isCompleted,
  onRestartSession,
  onResetSession
}) {
  const formatTime = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)) : 0;

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/40 px-6 py-4 text-slate-100 flex flex-wrap items-center justify-between gap-4 z-20 shadow-2xl animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-300 flex items-center gap-2">
              Master Session Completed!
            </h3>
            <p className="text-xs text-slate-300">
              Target duration expired. Played <span className="font-bold text-cyan-400">{totalVideosPlayed} videos</span> continuously across <span className="font-bold text-cyan-400">{browserCount} sub-browsers</span> for "{channelTitle}".
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRestartSession}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Restart Session
          </button>
          <button
            onClick={onResetSession}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/90 border-b border-cyan-500/30 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 z-20 shadow-xl">
      {/* Master Countdown Timer */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SESSION REMAINING:</span>
          <span className="text-lg font-black text-cyan-300 bg-slate-900 px-3 py-0.5 rounded border border-cyan-500/40 tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* Session Progress Bar & Details */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Channel: <strong className="text-cyan-300">{channelTitle}</strong></span>
            <span>{Math.round(progressPercent)}% Elapsed</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="text-right font-mono text-xs text-slate-300 shrink-0">
          <div className="text-[10px] text-slate-400">Total Played</div>
          <div className="font-extrabold text-cyan-400 text-sm">{totalVideosPlayed} Videos</div>
        </div>
      </div>
    </div>
  );
}
