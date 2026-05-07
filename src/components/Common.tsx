import React from 'react';

export const LoadingSkeleton = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 animate-pulse">
    <div className="w-12 h-12 bg-slate-800 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" />
    <div className="h-4 w-48 bg-slate-800 rounded-lg" />
    <div className="h-4 w-32 bg-slate-800 rounded-lg" />
  </div>
);

export const EmptyState = ({ icon: Icon, title, message }: { icon: any, title: string, message: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60 gap-6 text-center p-12 transition-all duration-700">
    <div className="p-6 bg-slate-900 rounded-[2.5rem] rotate-12 group-hover:rotate-0 transition-transform shadow-2xl">
      <Icon size={56} className="text-primary/40 -rotate-12 group-hover:rotate-0 transition-transform" />
    </div>
    <div className="space-y-2 max-w-xs">
      <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-300">{title}</h3>
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
  </div>
);

export const Switch = ({ enabled, onChange, label, description }: { enabled: boolean, onChange: (v: boolean) => void, label: string, description?: string }) => (
  <div className="flex items-center justify-between py-1 transition-all">
    <div className="flex flex-col">
      <span className="text-sm font-black text-slate-200 tracking-tight italic">{label}</span>
      {description && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{description}</span>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-spring focus:outline-none ${enabled ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]' : 'bg-slate-800 shadow-inner'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-spring ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

export const RadioGroup = ({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: { label: string, value: string }[], label: string }) => (
  <div className="flex flex-col gap-3 py-1">
    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            value === opt.value 
              ? 'bg-slate-800 text-primary shadow-lg border border-slate-700' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export const Slider = ({ value, onChange, min, max, label, unit = '' }: { value: number, onChange: (v: number) => void, min: number, max: number, label: string, unit?: string }) => (
  <div className="flex flex-col gap-3 py-1">
    <div className="flex justify-between items-center">
      <span className="text-xs font-black text-slate-200 italic uppercase tracking-tight">{label}</span>
      <span className="text-[10px] font-black tabular-nums bg-slate-800 text-primary px-2 py-0.5 rounded-full border border-slate-700">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all border border-slate-700 shadow-inner"
    />
  </div>
);
