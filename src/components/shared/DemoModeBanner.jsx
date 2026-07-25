import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Persistent banner shown on every page while a Demo Mode session is
 * active, so it's always clear that actions are simulated and nothing
 * permanent is happening to real data.
 */
export default function DemoModeBanner() {
  const { demoSession } = useAuth();

  if (!demoSession) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning-500 px-4 py-2 text-center text-sm font-medium text-gray-900"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        🟡 Demo Mode — Actions are simulated. No permanent changes are made.
      </span>
    </div>
  );
}
