import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';

interface SecurityGuardProps {
  user: UserProfile | null;
  children: React.ReactNode;
  onShowWarning?: (msg: string) => void;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({ children, onShowWarning }) => {
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);

  useEffect(() => {
    // 1. Prevent Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (onShowWarning) {
        onShowWarning('Right-click inspect is disabled for security!');
      }
      return false;
    };

    // 2. Keydown interception for screenshot / print / devtools
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code.toLowerCase();

      // PrintScreen Key
      if (key === 'printscreen' || code === 'printscreen' || e.keyCode === 44) {
        e.preventDefault();
        setScreenshotAttempted(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        if (onShowWarning) {
          onShowWarning('Screenshots are blocked on this protected panel!');
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

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onShowWarning]);

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

      {/* Main Application Content */}
      <div>
        {children}
      </div>
    </div>
  );
};
