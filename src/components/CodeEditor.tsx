import React, { useState, useMemo } from 'react';
import Editor from "@monaco-editor/react";
import { Upload, Code2 } from 'lucide-react';
import { AppSettings, Issue } from '../types';

interface CodeEditorProps {
  code: string;
  setCode: (c: string) => void;
  language: string;
  settings: AppSettings;
  onFileUpload: (file: File) => void;
  issues?: Issue[];
}

export const CodeEditor = ({ 
  code, 
  setCode, 
  language, 
  settings, 
  onFileUpload,
  issues = []
}: CodeEditorProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monaco.editor.defineTheme('pure-black', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000',
        'editor.lineHighlightBackground': '#111111',
        'editorGutter.background': '#000000',
      }
    });
    editor.focus();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const monacoLanguage = useMemo(() => {
    const map: Record<string, string> = {
      'python': 'python',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'plaintext': 'plaintext'
    };
    return map[language] || 'plaintext';
  }, [language]);

  return (
    <div 
      className={`flex-1 flex flex-col overflow-hidden relative ${isDragging ? 'ring-2 ring-primary ring-inset' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex items-center justify-between border-b h-10 px-4 shrink-0 shadow-sm z-20 ${settings.theme === 'light' && !settings.editorBlack ? 'bg-slate-50 border-slate-200' : 'bg-black border-slate-800'}`}>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${settings.theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>Environment:</span>
            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest">{language}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 opacity-50 italic">
            {settings.wordWrap ? 'Wrap Mode Active' : 'Static View'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          theme={settings.editorBlack ? "pure-black" : (settings.theme === 'light' ? "light" : "vs-dark")}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: settings.fontSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            tabSize: settings.tabSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            fontFamily: "'JetBrains Mono', monospace",
            renderLineHighlight: 'all',
            lineNumbersMinChars: 3,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            }
          }}
        />

        {isDragging && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-primary/10 backdrop-blur-[2px]">
            <div className="bg-slate-950/90 border-2 border-dashed border-primary rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="p-5 bg-primary/20 rounded-full animate-bounce">
                <Upload size={48} className="text-primary" />
               </div>
               <div className="text-center space-y-1">
                 <h4 className="text-white font-black text-xl uppercase tracking-tight italic">Ingest Source</h4>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Supports common dev extensions</p>
               </div>
            </div>
          </div>
        )}

        {!code && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-slate-800 flex flex-col items-center gap-4">
              <Code2 size={80} strokeWidth={0.5} className="opacity-20 translate-y-4" />
              <p className="font-black text-[10px] uppercase tracking-[0.4em] opacity-40">Awaiting input stream</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
