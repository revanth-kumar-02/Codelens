/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

// Types & Services
import { Mode, AppSettings, AnalysisResult, DEFAULT_SETTINGS } from './types';
import { aiService } from './services/ai.service';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { ReviewPane } from './components/ReviewPane';
import { DebugPane } from './components/DebugPane';
import { ExplainPane } from './components/ExplainPane';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // --- UI State ---
  const [mode, setMode] = useState<Mode>('Review');
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  // --- Data State ---
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [filename, setFilename] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  // --- Analysis State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // --- Mobile Detection ---
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024 && !sessionStorage.getItem('mobile_warn_dismissed')) {
        setShowMobileWarning(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Settings State ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('codelens_settings_v2');
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; } 
      catch (e) { return DEFAULT_SETTINGS; }
    }
    return DEFAULT_SETTINGS;
  });

  // --- Persistence & Theming ---
  useEffect(() => {
    localStorage.setItem('codelens_settings_v2', JSON.stringify(settings));
    if (settings.theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
  }, [settings]);

  useEffect(() => {
    const savedCode = localStorage.getItem('codelens_autosave_code');
    if (savedCode) { setCode(savedCode); detectLanguage(savedCode); }
  }, []);

  useEffect(() => {
    if (!code) { setSaveStatus('idle'); return; }
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('codelens_autosave_code', code);
      setSaveStatus('saved');
      const resetTimer = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(resetTimer);
    }, 1500);
    return () => clearTimeout(timer);
  }, [code]);

  // --- Core Actions ---

  const languageTimerRef = React.useRef<number | null>(null);

  const detectLanguage = useCallback(async (codeContent: string) => {
    if (!settings.autoDetect || !codeContent.trim()) return;
    
    if (languageTimerRef.current) clearTimeout(languageTimerRef.current);

    languageTimerRef.current = window.setTimeout(async () => {
      try {
        const detected = await aiService.detectLanguage(codeContent);
        setLanguage(detected.toLowerCase());
      } catch (err) {
        setLanguage('plaintext');
      }
    }, 1500); // 1.5s debounce to save quota
  }, [settings.autoDetect]);

  const analyzeCode = async (level = settings.defaultLevel) => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setChatMessages([]);
    try {
      const result = await aiService.analyze(code, language, filename, level);
      setAnalysis(result);
      setHistory(prev => [code, ...prev.filter(h => h !== code)].slice(0, 10));
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("429") || msg.includes("quota")) {
        setError("Rate Limit Exceeded. Please wait 60 seconds.");
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), 60000);
      } else if (msg.includes("503")) {
        setError("AI Servers Heavy Load. Retrying in background...");
      } else {
        setError(err.message || "Intelligence Engine Offline");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askFollowUp = async (q: string) => {
    setIsAsking(true);
    setChatMessages(prev => [...prev, { role: 'user', content: q }]);
    try {
      const res = await aiService.chat(code, q, filename, analysis?.explanation);
      setChatMessages(prev => [...prev, { role: 'model', content: res }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'model', content: "Neural Interface Error: " + err.message }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-primary/30">
      <Navbar 
        mode={mode} setMode={setMode} 
        onAnalyze={() => analyzeCode()}
        isAnalyzing={isAnalyzing}
        isCooldown={isCooldown}
        saveStatus={saveStatus}
        hasCode={!!code.trim()}
      />
      
      <AnimatePresence>
        {showSettings && <SettingsModal settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          onClear={() => { setCode(''); setAnalysis(null); setLanguage('plaintext'); setFilename(''); }} 
          onUpload={() => (window as any).triggerFileInput?.()} 
          history={history} 
          loadHistory={(h) => { setCode(h); detectLanguage(h); }} 
          onShowSettings={() => setShowSettings(true)} 
        />
        
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Main Editor Zone */}
          <div className="flex-[6] min-w-0 h-full border-r border-slate-900 flex flex-col">
            <CodeEditor 
              code={code} 
              setCode={(c) => { setCode(c); detectLanguage(c); }} 
              language={language} 
              settings={settings} 
              onFileUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  setCode(content);
                  setFilename(file.name);
                  detectLanguage(content);
                };
                reader.readAsText(file);
              }} 
              issues={analysis?.issues}
            />
          </div>

          {/* Intelligence Panel */}
          <div className="flex-[4] min-w-0 h-full bg-slate-900/10 backdrop-blur-3xl flex flex-col border-l border-slate-900 shadow-[-20px_0_40px_rgba(0,0,0,0.3)]">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400 italic">{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 group-hover:bg-red-500/20 p-1 rounded-lg transition-all"><X size={14} /></button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {mode === 'Review' && <ReviewPane result={analysis} loading={isAnalyzing} settings={settings} />}
                {mode === 'Debug' && <DebugPane debug={analysis?.debug || null} loading={isAnalyzing} />}
                {mode === 'Explain' && (
                  <ExplainPane 
                    explanation={analysis?.explanation || null} 
                    onChat={askFollowUp} 
                    chatMessages={chatMessages} 
                    isAsking={isAsking} 
                    loading={isAnalyzing}
                    level={settings.defaultLevel}
                    setLevel={(lvl) => { setSettings(s => ({...s, defaultLevel: lvl as any})); if(code.trim()) analyzeCode(lvl as any); }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Warning Overlay */}
      <AnimatePresence>
        {showMobileWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle size={40} className="text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Desktop Recommended</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  CodeLens AI provides a high-density IDE experience. Mobile views may hide some advanced intelligence features. For the best experience, we recommend using a Laptop or Tablet.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowMobileWarning(false);
                  sessionStorage.setItem('mobile_warn_dismissed', 'true');
                }}
                className="w-full py-4 bg-primary text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
              >
                Okay, Proceed
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" className="hidden" 
        ref={(n) => { if(n) { (window as any).triggerFileInput = () => n.click(); }}} 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target?.result as string;
              if (content) {
                setCode(content);
                setFilename(file.name);
              }
            };
            reader.readAsText(file);
          }
        }}
      />
    </div>
  );
}
