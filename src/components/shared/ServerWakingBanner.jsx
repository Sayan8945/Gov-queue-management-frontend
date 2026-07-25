import { Loader2 } from 'lucide-react';
import { useServerStatusStore } from '@/store/serverStatusStore';

const AUTH_PATH_PREFIXES = ['/login', '/register', '/verify-email'];

/**
 * Shown whenever httpClient is retrying a request because the backend
 * looks like it's cold-starting (Render free tier spins down idle
 * instances). Gives the user a clear "please wait" signal instead of a
 * silently hanging request that looks frozen or broken.
 *
 * Skipped on auth pages — AuthLayout shows a dedicated ServerDelayModal
 * there instead, so the two don't stack on top of each other. This
 * component is rendered outside the Router context (see App.jsx), so it
 * reads window.location directly rather than useLocation().
 */
export default function ServerWakingBanner() {
  const isWaking = useServerStatusStore((s) => s.isWaking);
  const attempt = useServerStatusStore((s) => s.attempt);
  const maxAttempts = useServerStatusStore((s) => s.maxAttempts);

  const isAuthPage = AUTH_PATH_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));
  if (!isWaking || isAuthPage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-md"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>
        Please wait, the server is waking up (this can take up to a minute on first load)
        {maxAttempts > 0 ? ` — retry ${attempt}/${maxAttempts}` : ''}…
      </span>
    </div>
  );
}
