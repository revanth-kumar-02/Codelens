import React, { useState } from 'react';
import { Upload, Trash2, History, Settings, X, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryItem } from '../types';

interface SidebarProps {
  onClear: () => void;
  onUpload: () => void;
  history: HistoryItem[];
  loadHistory: (item: HistoryItem) => void;
  onShowSettings: () => void;
}

export const Sidebar = ({ 
  onClear, 
  onUpload, 
  history, 
  loadHistory,
  onShowSettings
}: SidebarProps) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <aside className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col justify-between py-8 shrink-0 z-40 relative">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 px-3">
          <button 
            onClick={onUpload}
            className="w-10 h-10 mx-auto flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-900 rounded-xl transition-all group"
            title="Upload Source File"
          >
            <Upload size={22} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
          
          <button 
            onClick={onClear}
            className="w-10 h-10 mx-auto flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-all group"
            title="Reset Workspace"
          >
            <Trash2 size={22} className="group-hover:rotate-12 transition-transform" />
          </button>

          <div className="h-px bg-slate-800 mx-2 opacity-50" />

          <div className="relative">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`w-10 h-10 mx-auto flex items-center justify-center transition-all group rounded-xl ${
                showHistory ? 'bg-primary/20 text-primary border border-primary/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'
              }`}
              title="Session History"
            >
              <History size={22} className="group-hover:scale-110 transition-transform" />
            </button>
            
            <AnimatePresence>
              {showHistory && (
                <motion.div 
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className="absolute top-0 left-14 w-72 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 min-h-[100px] max-h-96 overflow-hidden flex flex-col z-50 ml-2"
                >
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       Recent Snapshots
                    </h3>
                    <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="text-[10px] text-slate-600 text-center py-12 font-bold uppercase tracking-widest italic opacity-50">No snapshots saved</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {history.map((h) => (
                          <button 
                            key={h.id}
                            onClick={() => {
                              loadHistory(h);
                              setShowHistory(false);
                            }}
                            className="group/item text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500 group-hover/item:text-primary transition-colors shrink-0">
                              <FileCode size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-black text-slate-300 truncate group-hover/item:text-white transition-colors">
                                {h.name}
                              </span>
                              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter group-hover/item:text-primary/70 transition-colors">
                                {h.language} • {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-3">
        <button 
          onClick={onShowSettings}
          className="w-10 h-10 mx-auto flex items-center justify-center transition-all group rounded-xl text-slate-500 hover:text-white hover:bg-slate-900"
          title="Terminal Settings"
        >
          <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </aside>
  );
};
