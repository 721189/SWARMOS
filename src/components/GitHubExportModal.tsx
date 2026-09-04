import React, { useState } from 'react';
import { 
  Github, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Sparkles,
  GitBranch,
  FileCode,
  CheckCircle2
} from 'lucide-react';

interface GitHubExportModalProps {
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const gitBashScript = `#!/usr/bin/env bash
# ==============================================================================
# SWARMOS: GitHub Repository Push & Initializer Script
# ==============================================================================
set -e

echo "🚀 Initializing SWARMOS Git Repository..."

# 1. Initialize local repository
git init

# 2. Add all source files, documentation, workflows & scaffold
git add .

# 3. Create initial master commit
git commit -m "feat(swarm): SWARMOS CBBA multi-agent consensus engine, HIL MAVLink gateway, and Nebius cluster matrix"

# 4. Set main branch
git branch -M main

echo ""
echo "Enter your GitHub repository URL (e.g. https://github.com/YOUR_USER/swarmos.git):"
read -r REPO_URL

if [ -n "$REPO_URL" ]; then
    git remote add origin "$REPO_URL" || git remote set-url origin "$REPO_URL"
    echo "Pushing to GitHub..."
    git push -u origin main
    echo "✅ Successfully pushed to $REPO_URL!"
else
    echo "No remote URL provided. Repository initialized locally."
fi
`;

  const handleDownloadScript = () => {
    const blob = new Blob([gitBashScript], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'git_push.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col font-mono text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Push SWARMOS to Your GitHub
              </h2>
              <p className="text-[11px] text-slate-400">
                Automated turnkey instructions for exporting and pushing to GitHub.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Method 1: AI Studio Built-in Native Export */}
          <div className="rounded-xl border border-sky-500/40 bg-sky-950/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Method 1: 1-Click AI Studio Export (Fastest &amp; Recommended)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 font-bold">
                NO CLI NEEDED
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Google AI Studio has direct GitHub OAuth integration built right into the interface:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1">
              <li>Look at the <strong>top-right corner</strong> of your AI Studio screen (next to Share / Deploy).</li>
              <li>Click the <strong>Settings / Export</strong> menu icon.</li>
              <li>Select <strong>"Export to GitHub"</strong>.</li>
              <li>Type your preferred repository name (e.g. <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">swarmos</code>) and click confirm. All files and histories will be pushed automatically!</li>
            </ol>
          </div>

          {/* Method 2: Local Git CLI Push */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Method 2: Command Line (Git Terminal)
              </span>
              <button
                onClick={handleDownloadScript}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px]"
              >
                <Download className="w-3 h-3 text-sky-400" />
                <span>Download git_push.sh</span>
              </button>
            </div>

            <p className="text-slate-400 text-[11px]">
              Download the project ZIP via the <strong>Scaffold</strong> tab or run these standard Git commands in your terminal:
            </p>

            <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-3">
              <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`# 1. Initialize git
git init

# 2. Stage all files
git add .

# 3. Commit with semantic convention
git commit -m "feat(swarm): initial release of SWARMOS autonomous CBBA coordination engine"

# 4. Set main branch & remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/swarmos.git

# 5. Push to GitHub
git push -u origin main`}
              </pre>
              <button
                onClick={() => handleCopy(
`git init
git add .
git commit -m "feat(swarm): initial release of SWARMOS autonomous CBBA coordination engine"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/swarmos.git
git push -u origin main`,
                  'cli-cmds'
                )}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {copiedId === 'cli-cmds' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* GitHub Actions CI Included */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Included National-Level GitHub Assets:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>.github/workflows/ci.yml</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Pytest verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Defense Whitepaper &amp; Storyboard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Apache 2.0 Open Source License</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
