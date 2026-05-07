import React, { useState } from 'react';
import { Bug, CheckCircle2, Copy } from 'lucide-react';
import { LoadingSkeleton, EmptyState } from './Common';

interface DebugPaneProps {
  debug: {
    errorTitle: string;
    fileLine: string;
    rootCause: string;
    suggestedFix: string;
    fixedCode: string;
  } | null;
  loading: boolean;
}

export const DebugPane = ({ debug, loading }: DebugPaneProps) => {
  const [copied, setCopied] = useState(false);

  if (loading) return <LoadingSkeleton />;
  
  if (!debug) {
    return (
      <EmptyState 
        icon={Bug}
        title="Predictive Debugging"
        message="Our intelligence engine will identify potential runtime crashes and logical errors before you even hit run."
      />
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(debug.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-auto custom-scrollbar bg-slate-900/30">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-red-400 font-black text-xs uppercase tracking-widest leading-none">
          <Bug size={18} className="animate-pulse" />
          <span>Root Cause Identified</span>
        </div>
        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{debug.errorTitle}</h3>
        <p className="text-sm text-slate-400 leading-relaxed font-medium bg-red-500/5 p-4 rounded-xl border border-red-500/5">
          {debug.rootCause}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Suggested Resolution</h4>
        </div>
        
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest italic">Patch Applied</span>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? 'bg-green-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Patch'}
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-[400px] custom-scrollbar bg-slate-950/50">
            <pre className="text-xs font-mono text-slate-300">
              <code>{debug.fixedCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
