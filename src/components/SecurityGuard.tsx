import React, { useEffect, useState } from 'react';
import { ShieldAlert, EyeOff, Lock, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface SecurityGuardProps {
  user: UserProfile | null;
  children: React.ReactNode;
  onShowWarning?: (msg: string) => void;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({ user, children, onShowWarning }) => {
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    // 1. Prevent Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (onShowWarning) {
        onShowWarning('Right-click inspect is disabled for security!');
      }
      return false;
    };

    // 2. Window Focus & Visibility Change Handlers (Anti-Screen Recording / Snipping Shield)
    const handleBlur = () => {
      setIsWindowFocused(false);
    };

    const handleFocus = () => {
      setIsWindowFocused(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowFocused(false);
      } else {
        setIsWindowFocused(true);
      }
    };

    // 3. Keydown interception for screenshot / snipping / print / devtools
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code.toLowerCase();

      // PrintScreen Key / Snipping Tool
      if (key === 'printscreen' || code === 'printscreen' || e.keyCode === 44) {
        e.preventDefault();
        setScreenshotAttempted(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        if (onShowWarning) {
          onShowWarning('Screenshots are strictly blocked on this protected panel!');
        }
        setTimeout(() => setScreenshotAttempted(false), 3000);
        return false;
      }

      // Windows + Shift + S (Windows Snipping Tool)
      if ((e.key === 'S' || e.key === 's') && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setScreenshotAttempted(true);
        if (onShowWarning) {
          onShowWarning('Snipping Tool / Screen Capture is prohibited!');
        }
        setTimeout(() => setScreenshotAttempted(false), 3000);
        return false;
      }

      // Ctrl + P or Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && key === 'p') {
        e.preventDefault();
        if (onShowWarning) onShowWarning('Printing panel pages is prohibited!');
        return false;
      }

      // Ctrl + Shift + I / J / C or F12 (DevTools)
      if (
        key === 'f12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || key === 's'))
      ) {
        e.preventDefault();
        if (onShowWarning) onShowWarning('Developer tools inspection is disabled!');
        return false;
      }

      // Ctrl + U (View Source)
      if ((e.ctrlKey || e.metaKey) && key === 'u') {
        e.preventDefault();
        return false;
      }

      // Cmd + Shift + 3 / 4 / 5 (Mac Screenshot shortcuts)
      if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5')) {
        e.preventDefault();
        setScreenshotAttempted(true);
        if (onShowWarning) onShowWarning('macOS Screenshots are prohibited on this panel!');
        setTimeout(() => setScreenshotAttempted(false), 3000);
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onShowWarning]);

  const userIdentifier = user ? user.name || user.username || user.telegramId || 'Protected User' : 'NovaEsp Protected';

  return (
    <div className="relative min-h-screen select-none font-sans">
      {/* Screenshot Warning Toast Banner */}
      {screenshotAttempted && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-bounce">
          <div className="bg-rose-950 border-2 border-rose-500 text-rose-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Screenshot Blocked!</p>
              <p className="text-xs text-rose-300">Screen capture and recording are strictly prohibited on NovaEsp Panel.</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen Privacy Curtain on Window Focus Loss (Anti-Recording / Snipping Tool Shield) */}
      {!isWindowFocused && (
        <div 
          onClick={() => setIsWindowFocused(true)}
          className="fixed inset-0 z-[95] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center transition-all animate-fadeIn cursor-pointer"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 shadow-2xl shadow-teal-950/60">
            <EyeOff className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Protected Content
          </h2>
          <p className="text-slate-400 text-sm max-w-md mt-2 leading-relaxed">
            Screen recording and window capture protection active. Click anywhere inside this window to resume viewing NovaEsp Panel.
          </p>
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-teal-400">
            <Lock className="w-3.5 h-3.5" />
            <span>NOVA ESP DRM & SCREEN PROTECTION ACTIVE</span>
          </div>
        </div>
      )}

      {/* Main Application Content */}
      <div className={!isWindowFocused ? 'blur-2xl grayscale opacity-10 transition-all duration-300 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

