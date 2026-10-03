import React, { useState } from 'react';
import { X, Layers, Plus, FileText, CheckCircle2, Sparkles, Video, Globe, Play } from 'lucide-react';
import { processUrl } from '../utils/urlHelper';

export default function BulkImportModal({ isOpen, onClose, onImportLinks }) {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('append'); // 'append' or 'replace'

  if (!isOpen) return null;

  const handleImport = (e) => {
    e?.preventDefault();
    const lines = inputText
      .split('\n')
      .flatMap(line => line.split(','))
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length > 0) {
      onImportLinks(lines, mode);
      setInputText('');
      onClose();
    }
  };

  const loadSampleCollection = (type) => {
    if (type === 'lofi') {
      setInputText(
        `https://www.youtube.com/watch?v=jfKfPfyJRdk\nhttps://www.youtube.com/watch?v=4xDzrJKXOOY\nhttps://www.youtube.com/watch?v=5qap5aO4i9A\nhttps://www.youtube.com/watch?v=DWcJFNfaw9c`
      );
    } else if (type === 'space') {
      setInputText(
        `https://www.youtube.com/watch?v=P9C25Un7qpY\nhttps://www.youtube.com/watch?v=21X5lGlDOfg\nhttps://www.youtube.com/watch?v=xRPjK7Bq2sw\nhttps://www.youtube.com/watch?v=Xh0l0t1k1u0`
      );
    } else if (type === 'news') {
      setInputText(
        `https://en.wikipedia.org/wiki/Portal:Current_events\nhttps://news.ycombinator.com\nhttps://www.youtube.com/watch?v=9Auq9mYxFEE\nhttps://www.youtube.com/watch?v=2g811Eo7K8U`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Bulk Add Sub-Tabs & Links</h3>
              <p className="text-xs text-slate-400">Paste multiple URLs (one per line or comma-separated) to load instantly.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium shrink-0">Quick Sample Bundles:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSampleCollection('lofi')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Video size={12} /> 4x Lo-Fi Streams
              </button>
              <button
                type="button"
                onClick={() => loadSampleCollection('space')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Sparkles size={12} /> 4x NASA & Space Live
              </button>
              <button
                type="button"
                onClick={() => loadSampleCollection('news')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Globe size={12} /> Tech & News Feeds
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Paste URLs:</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`https://www.youtube.com/watch?v=...
https://twitch.tv/...
https://news.ycombinator.com
https://example.com/video.mp4`}
              rows={8}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
              autoFocus
            />
          </div>

          {/* Mode Selection */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={mode === 'append'}
                  onChange={() => setMode('append')}
                  className="accent-cyan-500"
                />
                Append to existing sub-tabs
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="accent-cyan-500"
                />
                Replace current sub-tabs
              </label>
            </div>

            <div className="text-slate-400 font-mono">
              Detected:{' '}
              <span className="text-cyan-400 font-bold">
                {inputText.split('\n').flatMap(l => l.split(',')).map(l => l.trim()).filter(Boolean).length}
              </span>{' '}
              links
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-950 border-t border-slate-800 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <Play size={14} /> Import & Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
