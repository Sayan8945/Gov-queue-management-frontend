import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Megaphone } from 'lucide-react';
import { fetchDisplayDepartments, fetchDepartmentDisplay } from '@/services/displayService';
import { getDisplaySocket } from '@/services/socketClient';
import { formatDate, formatTime } from '@/utils/dateHelpers';

/**
 * Large public display / TV screen. Fetches real queue/counter/department
 * data from MongoDB via the public display-board API, then stays live via
 * the unauthenticated /display Socket.IO namespace — no mock data, no
 * frontend simulation.
 */
export default function PublicDisplayPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());

  const { data: departments } = useQuery({
    queryKey: ['display', 'departments'],
    queryFn: fetchDisplayDepartments,
    staleTime: 60000,
  });

  const departmentId = searchParams.get('dept') || departments?.[0]?._id;

  const { data } = useQuery({
    queryKey: ['display', departmentId],
    queryFn: () => fetchDepartmentDisplay(departmentId),
    enabled: Boolean(departmentId),
    refetchInterval: 15000, // fallback poll in case a socket event is missed
  });

  useEffect(() => {
    const clockId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockId);
  }, []);

  useEffect(() => {
    if (!departmentId) return undefined;

    const socket = getDisplaySocket();
    socket.connect();
    socket.emit('joinDepartment', departmentId);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['display', departmentId] });
    socket.on('displayRefresh', refresh);
    socket.on('tokenCalledNotification', refresh);

    return () => {
      socket.off('displayRefresh', refresh);
      socket.off('tokenCalledNotification', refresh);
      socket.disconnect();
    };
  }, [departmentId, queryClient]);

  if (!departments || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Loading live queue data…
      </div>
    );
  }

  const { department, nowServing, nextTokens, counters } = data;

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white sm:p-10">
      <header className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <Landmark className="h-10 w-10 text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{department?.departmentName}</h1>
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
          {nowServing.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500">
              No tokens currently being served
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {nowServing.map((token) => (
                  <motion.div
                    key={token._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="rounded-2xl border border-primary-800 bg-primary-950/60 p-6"
                  >
                    <p className="text-sm uppercase tracking-wide text-primary-300">
                      Counter {token.counterId?.counterNumber || '-'}
                    </p>
                    <p className="mt-2 text-5xl font-extrabold text-white">{token.tokenNumber}</p>
                    <p className="mt-2 text-sm text-gray-400">{token.serviceId?.serviceName}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-primary-400">
              <Megaphone className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Counter Status</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {counters.map((c) => (
                <span
                  key={c._id}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    c.status === 'active'
                      ? 'bg-success-900/60 text-success-300'
                      : c.status === 'break'
                      ? 'bg-warning-900/60 text-warning-300'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {c.counterNumber} · {c.status}
                </span>
              ))}
            </div>
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
                  key={token._id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="text-xl font-bold">{token.tokenNumber}</span>
                  </div>
                  <span className="text-sm text-gray-500">{token.serviceId?.serviceName}</span>
                </li>
              ))
            )}
          </ol>
        </section>
      </main>
    </div>
  );
}
