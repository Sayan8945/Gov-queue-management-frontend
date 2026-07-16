import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Megaphone } from 'lucide-react';
import { useQueueStore } from '@/store/queueStore';
import { useCatalogStore } from '@/store/catalogStore';
import { formatDate, formatTime } from '@/utils/dateHelpers';

/**
 * Large public display / TV screen. Intended to run full-screen in waiting
 * areas. Reads live from queueStore so it updates automatically as staff
 * call/complete tokens elsewhere in the app (simulated real-time).
 * TODO(backend): once Socket.IO exists, subscribe to department-scoped
 * 'queue:updated' events instead of relying on the local store subscription.
 */
export default function PublicDisplayPage() {
  const [searchParams] = useSearchParams();
  const departments = useCatalogStore((s) => s.departments);
  const getServiceById = useCatalogStore((s) => s.getServiceById);
  const departmentId = searchParams.get('dept') || departments[0]?.id;
  const department = departments.find((d) => d.id === departmentId) || departments[0];

  const [, setTick] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const unsubscribe = useQueueStore.subscribe(() => setTick((t) => t + 1));
    const clockId = setInterval(() => setNow(new Date()), 1000);
    return () => {
      unsubscribe();
      clearInterval(clockId);
    };
  }, []);

  const store = useQueueStore.getState();
  const counters = store.getCountersForDepartment(department.id);
  const nextTokens = store.getNextTokensPreview(department.id, 5);
  const announcements = store.announcements;

  const activeServing = counters
    .map((c) => ({ counter: c, token: store.getCurrentTokenForCounter(c.id) }))
    .filter((entry) => entry.token);

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white sm:p-10">
      <header className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Landmark className="h-10 w-10 text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{department.name}</h1>
            <p className="text-gray-400">Government Service Center</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums sm:text-4xl">{formatTime(now)}</p>
          <p className="text-gray-400">{formatDate(now, 'EEEE, dd MMMM yyyy')}</p>
        </div>
      </header>

      <main className="mt-8 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-gray-400">
            Now Serving
          </h2>
          {activeServing.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500">
              No tokens currently being served
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {activeServing.map(({ counter, token }) => (
                  <motion.div
                    key={counter.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="rounded-2xl border border-primary-800 bg-primary-950/60 p-6"
                  >
                    <p className="text-sm uppercase tracking-wide text-primary-300">
                      Counter {counter.number}
                    </p>
                    <p className="mt-2 text-5xl font-extrabold text-white">{token.tokenNumber}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      {token.citizenName} · {getServiceById(token.serviceId)?.name}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-primary-400">
              <Megaphone className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Announcements</span>
            </div>
            <p className="mt-2 text-lg text-gray-200">
              {announcements[0]?.message || 'Welcome to the Citizen Service Center.'}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-gray-400">
            Next in Line
          </h2>
          <ol className="space-y-3">
            {nextTokens.length === 0 ? (
              <li className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center text-gray-500">
                Queue is empty
              </li>
            ) : (
              nextTokens.map((token, idx) => (
                <li
                  key={token.id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="text-xl font-bold">{token.tokenNumber}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getServiceById(token.serviceId)?.name}
                  </span>
                </li>
              ))
            )}
          </ol>
        </section>
      </main>
    </div>
  );
}
