import React, { useState } from 'react';
import { ScaffoldFile } from '../types';
import { SCAFFOLD_FILES } from '../data/scaffoldData';
import JSZip from 'jszip';
import { 
  FolderTree, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Box, 
  Brain, 
  Cpu, 
  Sliders, 
  Eye, 
  Terminal
} from 'lucide-react';

export const ScaffoldExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ScaffoldFile>(SCAFFOLD_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('swarmos');
      if (!folder) return;

      // Add all scaffold files
      SCAFFOLD_FILES.forEach((file) => {
        folder.file(file.path, file.content);
      });

      // Also add generated scripts and configs
      folder.file('generate_architecture.py', `# Architectural generation script`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'swarmos-project-scaffold.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const categories = [
    { key: 'docs', label: 'Docs & Scripts', icon: FileText },
    { key: 'engine', label: 'Swarm Engine (CBBA)', icon: Cpu },
    { key: 'ai', label: 'AI Layer (Nemotron)', icon: Brain },
    { key: 'jobs', label: 'Nebius Cloud Jobs', icon: Box },
    { key: 'ui', label: 'Pygame UI & HUD', icon: Eye },
    { key: 'utils', label: 'Configs & Utils', icon: Sliders },
  ];

  return (
    <div className="flex flex-col h-[740px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <FolderTree className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              SWARMOS Project Scaffold Explorer
            </h2>
            <p className="text-[11px] text-slate-400">
              Complete production Python codebase, CBBA engine, Nemotron prompts &amp; Nebius job matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="download-scaffold-zip-btn"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            {isZipping ? 'Bundling ZIP...' : 'Download Project ZIP'}
          </button>
        </div>
      </div>

      {/* Main split view: File tree on left, Code viewer on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar File Tree */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/40 p-3 overflow-y-auto space-y-4">
          {categories.map((cat) => {
            const files = SCAFFOLD_FILES.filter((f) => f.category === cat.key);
            if (files.length === 0) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5 text-sky-400" />
                  {cat.label}
                </div>
                <div className="space-y-0.5">
                  {files.map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono text-left transition-colors ${
                          isSelected
                            ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Code Content View */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/40 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-2">
              <span className="text-slate-500">swarmos/</span>
              <strong className="text-sky-300">{selectedFile.path}</strong>
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#0b1120]">
            <pre className="select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
