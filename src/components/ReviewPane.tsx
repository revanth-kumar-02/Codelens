import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, XCircle, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { AnalysisResult, AppSettings } from '../types';
import { LoadingSkeleton, EmptyState } from './Common';

interface ReviewPaneProps {
  result: AnalysisResult | null;
  loading: boolean;
  settings: AppSettings;
}

export const ReviewPane = ({ result, loading, settings }: ReviewPaneProps) => {
  if (loading) return <LoadingSkeleton />;
  
  if (!result || !result.issues) {
    return (
      <EmptyState 
        icon={Sparkles}
        title="Ready for Analysis"
        message="Upload or paste code to get a comprehensive review of your code's quality, security, and performance."
      />
    );
  }

  const { score, good, bad, issues } = result;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Needs Work';
    return 'Critical';
  };

  const renderRichText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-100 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 gap-8 overflow-auto custom-scrollbar bg-slate-900/30">
      {settings.showRating && (
        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mix-blend-screen">Production Readiness</h3>
                <div className="flex items-baseline gap-3">
                  <span className={`text-6xl font-black italic tracking-tighter tabular-nums ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-slate-700 text-xl font-black italic">/100</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-[10px] font-black px-4 py-1.5 rounded-full ${getScoreBg(score)} text-slate-950 uppercase tracking-widest italic shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]`}>
                  {getScoreLabel(score)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ 
                    opacity: score >= (i + 1) * 10 ? 1 : 0.2, 
                    scaleX: score >= (i + 1) * 10 ? 1 : 0.5 
                  }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex-1 rounded-full ${score >= (i + 1) * 10 ? getScoreBg(score) : 'bg-slate-700/50'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-3xl hover:bg-green-500/10 transition-all group">
          <div className="flex items-center gap-3 text-green-400 font-black text-xs uppercase tracking-[0.25em] mb-6">
            <div className="p-2.5 bg-green-500/20 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <CheckCircle2 size={20} />
            </div>
            <span>Strategic wins</span>
          </div>
          <ul className="space-y-4">
            {good.map((item, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex gap-4 text-sm text-slate-400 leading-relaxed group/item"
              >
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500/40 shrink-0 group-hover/item:scale-150 group-hover/item:bg-green-500 transition-all" />
                <div className="flex-1">
                  {renderRichText(item)}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl hover:bg-red-500/10 transition-all group">
          <div className="flex items-center gap-3 text-red-400 font-black text-xs uppercase tracking-[0.25em] mb-6">
            <div className="p-2.5 bg-red-500/20 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
              <XCircle size={20} />
            </div>
            <span>Technical Debt</span>
          </div>
          <ul className="space-y-4">
            {bad.map((item, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex gap-4 text-sm text-slate-400 leading-relaxed group/item"
              >
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500/40 shrink-0 group-hover/item:scale-150 group-hover/item:bg-red-500 transition-all" />
                <div className="flex-1">
                  {renderRichText(item)}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Security & Logic Audit</h2>
          <span className="font-mono text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
            {issues.length} FINDINGS
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {issues.map((issue) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={issue.id} 
              className={`bg-slate-800/40 border border-slate-800 rounded-xl p-5 relative overflow-hidden transition-all hover:bg-slate-800/60 group`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                issue.type === 'error' ? 'bg-red-500' : 
                issue.type === 'warning' ? 'bg-yellow-500' : 
                'bg-blue-500'
              }`} />
              
              <div className="flex items-start gap-4">
                <div className={`mt-1 ${
                  issue.type === 'error' ? 'text-red-400' : 
                  issue.type === 'warning' ? 'text-yellow-400' : 
                  'text-blue-400'
                }`}>
                  {issue.type === 'error' ? <AlertCircle size={18} /> : 
                   issue.type === 'warning' ? <AlertTriangle size={18} /> : 
                   <Lightbulb size={18} />}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-200 uppercase tracking-tight italic">{issue.title}</h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-400 tracking-widest">{issue.line}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{issue.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
