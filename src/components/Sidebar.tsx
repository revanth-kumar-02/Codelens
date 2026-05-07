import React, { useState } from 'react';
import { Upload, Trash2, History, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onClear: () => void;
  onUpload: () => void;
  history: string[];
  loadHistory: (code: string) => void;
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
                  className="absolute top-0 left-14 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 min-h-[100px] max-h-96 overflow-auto z-50 ml-2"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                       Recent Snapshots
                    </h3>
                    <button onClick={() => setShowHistory(false)} className="text-slate-600 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-[10px] text-slate-700 text-center py-10 font-bold uppercase tracking-widest italic">No snapshots saved</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {history.map((h, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            loadHistory(h);
                            setShowHistory(false);
                          }}
                          className="text-left p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800 hover:scale-[1.02] text-[11px] text-slate-400 font-mono line-clamp-3 border border-slate-800/50 transition-all shadow-inner"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
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
