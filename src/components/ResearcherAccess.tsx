import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, Check, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'swarmos_researcher_access';
// Default passcodes that unlock researcher mode (case-insensitive or exact)
const VALID_PASSCODES = ['shivam', 'singh', 'researcher', 'swarmos', 'admin', 'bft2026', 'cbba2026'];

export function useResearcherAccess() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // 1. Check URL parameters for direct passkey ?passcode=shivam or ?access=researcher or ?key=shivam
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlKey = params.get('passcode') || params.get('access') || params.get('key') || params.get('auth');
      if (urlKey && VALID_PASSCODES.includes(urlKey.toLowerCase().trim())) {
        try {
          localStorage.setItem(STORAGE_KEY, 'unlocked_valid');
        } catch {}
        return true;
      }
      // 2. Check localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'unlocked_valid') return true;
      } catch {}
    }
    return false;
  });

  const unlock = (code: string): boolean => {
    const clean = code.trim().toLowerCase();
    if (VALID_PASSCODES.includes(clean)) {
      setIsUnlocked(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'unlocked_valid');
      } catch {}
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Clean query params without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('passcode');
      url.searchParams.delete('access');
      url.searchParams.delete('key');
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  return { isUnlocked, unlock, lock };
}

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unlock: (code: string) => boolean;
}

export const ResearcherUnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  unlock,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const ok = unlock(inputCode);
    if (ok) {
      setInputCode('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Invalid researcher access key. Please enter your authorized passkey.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Author &amp; Researcher Access
              </h3>
              <p className="text-[11px] text-slate-400">
                Unlock Technical Preprint &amp; Demo Script
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The 6-page IEEE technical preprint paper and demo video script are protected for author evaluation. Enter your researcher passcode to unlock full access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Enter Passcode</span>
              <span className="text-slate-500 lowercase font-normal">(e.g. shivam / researcher)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Passkey..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-sky-500 focus:outline-none text-white text-xs font-mono tracking-wider pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                {errorMsg}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Direct URL Access Option:
            </div>
            <p className="text-slate-400 leading-normal">
              You can also open your Vercel link directly with URL query parameters:
            </p>
            <code className="block p-1.5 bg-slate-900 rounded text-sky-300 text-[10px] break-all">
              https://your-domain.vercel.app/?passcode=shivam
            </code>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              Unlock Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
