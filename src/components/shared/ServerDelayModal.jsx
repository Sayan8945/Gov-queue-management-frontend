import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useServerStatusStore } from '@/store/serverStatusStore';

/**
 * Popup version of the server-waking notice, shown on auth pages (login,
 * register, verify-email) where a slow/cold-starting backend is most
 * likely to be confused for a broken submit button. Reads the same
 * serverStatusStore state as ServerWakingBanner — httpClient sets it
 * whenever it's retrying a timed-out/502/503 request.
 */
export default function ServerDelayModal() {
  const isWaking = useServerStatusStore((s) => s.isWaking);
  const attempt = useServerStatusStore((s) => s.attempt);
  const maxAttempts = useServerStatusStore((s) => s.maxAttempts);

  return (
    <Modal isOpen={isWaking} onClose={() => {}} title="Please wait" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950">
          <Loader2 className="h-7 w-7 animate-spin text-primary-600" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            The server is waking up
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This can take up to a minute on the first request after a period of inactivity.
            {maxAttempts > 0 ? ` Retrying… (${attempt}/${maxAttempts})` : ' Hang tight, retrying…'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
