import React from 'react';
import { motion } from 'motion/react';
import { Settings, X, Code2, Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import { Switch, RadioGroup, Slider } from './Common';

interface SettingsModalProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal = ({ settings, setSettings, onClose }: SettingsModalProps) => {
  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex-col h-full flex"
      >
        <div className="flex-none flex items-center justify-between px-12 py-6 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
              <Settings size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-tight text-primary">System Matrix</h2>
              <p className="text-[9px] text-slate-500 font-black tracking-[0.4em] uppercase opacity-70">Personalize Your IDE Intelligence Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800/50 rounded-2xl text-slate-500 hover:text-white transition-all group border border-transparent hover:border-slate-700">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar min-h-0">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Section: Core DNA */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary/30" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Core DNA</h3>
              </div>
              <div className="space-y-6 bg-slate-900/40 p-6 rounded-[1.5rem] border border-slate-800/50">
                <Switch 
                  label="Contextual Sensing" 
                  description="Auto-detect code grammar"
                  enabled={settings.autoDetect} 
                  onChange={(v) => updateSetting('autoDetect', v)} 
                />
                <Slider 
                  label="Optical Scaling" 
                  unit="px"
                  min={12} max={22} 
                  value={settings.fontSize} 
                  onChange={(v) => updateSetting('fontSize', v)} 
                />
                <Switch 
                  label="Adaptive Wrap" 
                  enabled={settings.wordWrap} 
                  onChange={(v) => updateSetting('wordWrap', v)} 
                />
              </div>
            </div>

            {/* Section: Logic Flow */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary/30" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Logic Flow</h3>
              </div>
              <div className="space-y-6 bg-slate-900/40 p-6 rounded-[1.5rem] border border-slate-800/50">
                <Switch 
                  label="Reactive Analysis" 
                  description="Analyze on code mutation"
                  enabled={settings.autoAnalyze} 
                  onChange={(v) => updateSetting('autoAnalyze', v)} 
                />
                <RadioGroup 
                  label="Cognitive Depth" 
                  value={settings.defaultLevel} 
                  options={[
                    {label: 'Novice', value: 'beginner'}, 
                    {label: 'Pro', value: 'intermediate'}, 
                    {label: 'Elite', value: 'advanced'}
                  ]}
                  onChange={(v) => updateSetting('defaultLevel', v)} 
                />
                <Switch 
                  label="Health Indicator" 
                  enabled={settings.showRating} 
                  onChange={(v) => updateSetting('showRating', v)} 
                />
              </div>
            </div>

            {/* Section: Interface Geometry */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary/30" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Geometry</h3>
              </div>
              <div className="space-y-6 bg-slate-900/40 p-6 rounded-[1.5rem] border border-slate-800/50">
                <RadioGroup 
                  label="Spectral Theme" 
                  value={settings.theme} 
                  options={[{label: 'Midnight', value: 'dark'}, {label: 'Clinical', value: 'light'}]}
                  onChange={(v) => updateSetting('theme', v)} 
                />
                <RadioGroup 
                  label="Information Density" 
                  value={settings.layout} 
                  options={[{label: 'Vast', value: 'comfortable'}, {label: 'Tight', value: 'compact'}]}
                  onChange={(v) => updateSetting('layout', v)} 
                />
                <Switch 
                  label="Onyx Editor" 
                  description="Force pure black background"
                  enabled={settings.editorBlack} 
                  onChange={(v) => updateSetting('editorBlack', v)} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none py-6 flex flex-col items-center gap-6 relative z-30">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-primary transition-all flex items-center gap-3 italic"
            >
              <RefreshCw size={12} className="opacity-50" />
              Reset Matrix
            </button>
            
            <button 
              onClick={onClose}
              className="px-10 py-3 bg-primary text-slate-950 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 shadow-[0_12px_24px_-8px_rgba(var(--primary-rgb),0.5)] transition-all uppercase tracking-tight italic"
            >
              Engage Modifications
            </button>
          </div>

          <div className="flex flex-col items-center text-center gap-1.5 overflow-hidden">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
              CodeLens.ai v1.0.0
            </h4>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              © 2026 CodeLens.ai . All rights reserved to Gugapriya.
            </p>
            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.2em] italic text-primary/40">
              Released on 23 April 2026.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
