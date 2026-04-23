import React from 'react';
import { Code2, RefreshCw, CloudCheck, Play, Sparkles, AlertCircle } from 'lucide-react';
import { Mode } from '../types';

interface NavbarProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isCooldown: boolean;
  cooldownTime: number;
  saveStatus: 'idle' | 'saving' | 'saved';
  hasCode: boolean;
}

export const Navbar = ({ mode, setMode, onAnalyze, isAnalyzing, isCooldown, cooldownTime, saveStatus, hasCode }: NavbarProps) => {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-slate-900/50 border-b border-slate-800 backdrop-blur-xl shrink-0 z-50">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Code2 className="text-primary w-6 h-6" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-black text-xl text-white tracking-tighter italic uppercase leading-none">CodeLens AI</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Dev Intelligence</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-slate-950/50 rounded-xl p-1 border border-slate-800">
          {(['Review', 'Debug', 'Explain'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-widest ${
                mode === m 
                  ? 'bg-slate-800 text-primary shadow-lg border border-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 mr-6">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
              <RefreshCw size={12} className="animate-spin" />
              <span>Syncing</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-500/60 uppercase tracking-widest">
              <CloudCheck size={14} />
              <span>Ready</span>
            </div>
          )}
        </div>


        <button 
          onClick={onAnalyze}
          disabled={isAnalyzing || isCooldown || !hasCode}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
        >
          {isAnalyzing ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : isCooldown ? (
            <AlertCircle size={16} className="animate-pulse" />
          ) : (
            <Sparkles size={16} />
          )}
          {isAnalyzing ? 'Analyzing...' : isCooldown ? `Cooling Down (${cooldownTime}s)...` : 'Analyze Intelligence'}
        </button>
      </div>
    </header>
  );
};
