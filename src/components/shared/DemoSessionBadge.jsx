import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

// Mirrors the backend's JWT_ACCESS_EXPIRES_IN default (15 minutes) — purely
// a UI countdown so visitors know their demo session (like any real
// session) will need a fresh login once the access token naturally expires.
const DEMO_SESSION_DURATION_MS = 15 * 60 * 1000;

function formatRemaining(ms) {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Floating badge shown while a Demo Mode session is active, counting down
 * to when the session naturally expires (access token expiry). Logs the
 * user out automatically when it hits zero — matches normal session
 * expiry behavior, just made visible for a demo audience.
 */
export default function DemoSessionBadge() {
  const { demoSession, logout } = useAuth();
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    if (!demoSession) return;

    const tick = () => {
      const elapsed = Date.now() - demoSession.startedAt;
      const remaining = DEMO_SESSION_DURATION_MS - elapsed;
      setRemainingMs(remaining);

      if (remaining <= 0) {
        logout();
        toast.error('Your demo session has expired. Start a new one anytime.');
        // This component renders outside the Router (mounted in App.jsx
        // alongside <AppRouter/>, not inside it), so useNavigate() isn't
        // available here — a full navigation is the correct equivalent.
        window.location.href = '/login';
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [demoSession, logout]);

  if (!demoSession || remainingMs === null) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-warning-500/40 bg-white/90 px-4 py-2 text-xs font-medium text-gray-700 shadow-lg backdrop-blur-sm dark:bg-gray-800/90 dark:text-gray-200">
      <Clock className="h-3.5 w-3.5 text-warning-600" aria-hidden="true" />
      <span>Demo Session · {formatRemaining(remainingMs)} remaining</span>
    </div>
  );
}
