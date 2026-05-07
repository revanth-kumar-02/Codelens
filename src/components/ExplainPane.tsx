import React, { useState } from 'react';
import { BrainCircuit, Send, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingSkeleton, EmptyState } from './Common';

interface ExplainPaneProps {
  explanation: {
    whatItDoes: string;
    howItWorks: { title: string; description: string; code?: string }[];
    proTip: string;
  } | null;
  onChat: (question: string) => void;
  chatMessages: { role: 'user' | 'model', content: string }[];
  isAsking: boolean;
  loading: boolean;
  level: string;
  setLevel: (l: string) => void;
}

export const ExplainPane = ({ explanation, onChat, chatMessages, isAsking, loading, level, setLevel }: ExplainPaneProps) => {
  const [question, setQuestion] = useState('');

  if (loading) return <LoadingSkeleton />;
  
  if (!explanation) {
    return (
      <EmptyState 
        icon={BrainCircuit}
        title="Logic Decryption"
        message="Convert complex code abstractions into human-readable logical steps tailored to your experience level."
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isAsking) {
      onChat(question);
      setQuestion('');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/30">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Core Logic Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Technical Briefing</h3>
            <div className="flex gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {['beginner', 'intermediate', 'advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                    level === l ? 'bg-slate-800 text-primary shadow-sm' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuit size={120} strokeWidth={1} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold italic relative z-10">
              "{explanation.whatItDoes}"
            </p>
          </div>
        </section>

        {/* Breakdown Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2 italic">Knowledge Matrix</h4>
          <div className="space-y-3">
            {explanation.howItWorks.map((step, i) => (
              <div key={i} className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-5 hover:bg-slate-950/60 transition-all group">
                <h5 className="text-[11px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                  <span className="opacity-30">0{i + 1} //</span> {step.title}
                </h5>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{step.description}</p>
                {step.code && (
                  <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/50 font-mono text-[10px] text-slate-500 overflow-x-auto">
                    {step.code}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Chat Interface */}
        <section className="mt-12 space-y-6">
          <div className="h-px bg-slate-800/50 w-full" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2 italic">Neural Interrogator</h4>
          
          <div className="space-y-4 px-2">
            <AnimatePresence>
              {chatMessages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 border border-primary/20 text-slate-200 rounded-br-none italic' 
                      : 'bg-slate-800/50 border border-slate-800 text-slate-400 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isAsking && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-3xl rounded-bl-none animate-pulse">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-950/50 border-t border-slate-800 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex gap-3 relative">
          <input 
            type="text" 
            placeholder="Interrogate logic details..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all italic font-semibold"
          />
          <button 
            type="submit"
            disabled={isAsking || !question.trim()}
            className="absolute right-2 top-2 bottom-2 px-5 bg-primary text-slate-950 rounded-xl font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isAsking ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
