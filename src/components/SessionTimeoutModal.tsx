import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface SessionTimeoutModalProps {
  onLogout: () => void;
  inactivityLimitMinutes?: number; // default 30 mins
  warningDurationSeconds?: number; // default 60s countdown
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  onLogout,
  inactivityLimitMinutes = 30,
  warningDurationSeconds = 60,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(warningDurationSeconds);
  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const inactivityMs = inactivityLimitMinutes * 60 * 1000;

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setTimeLeft(warningDurationSeconds);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
  }, [showWarning, warningDurationSeconds]);

  // Track user activity
  useEffect(() => {
    const handleUserActivity = () => {
      // Only reset activity timestamp if the warning is NOT currently showing
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [showWarning]);

  // Periodically check for inactivity
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!showWarning) {
        const now = Date.now();
        const elapsed = now - lastActivityRef.current;
        if (elapsed >= inactivityMs) {
          setShowWarning(true);
          setTimeLeft(warningDurationSeconds);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInterval);
  }, [inactivityMs, showWarning, warningDurationSeconds]);

  // Countdown timer when warning modal is displayed
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning, onLogout]);

  if (!showWarning) return null;

  const progressPercent = (timeLeft / warningDurationSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-950/30 relative overflow-hidden space-y-5">
        {/* Animated Countdown Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              Session Timeout Warning
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You have been inactive for <span className="text-amber-300 font-semibold">{inactivityLimitMinutes} minutes</span>.
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Automatic logout in:</span>
          </div>
          <span className="font-mono font-bold text-lg text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          For security purposes, inactive sessions are automatically terminated. Would you like to stay logged in?
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Now</span>
          </button>
          <button
            onClick={resetInactivityTimer}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Stay Logged In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
