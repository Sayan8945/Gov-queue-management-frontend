import { useEffect, useState } from 'react';
import { useQueueStore } from '@/store/queueStore';

/**
 * Subscribes a component to queueStore changes for a given department and
 * re-renders on every tick, giving the illusion of a live/real-time feed.
 * TODO(backend): once Socket.IO is wired up, this hook can additionally
 * subscribe to `queue:update` events for the department room.
 */
export function useLiveQueue(departmentId) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = useQueueStore.subscribe(() => setTick((t) => t + 1));
    return unsubscribe;
  }, []);

  const store = useQueueStore.getState();
  return {
    waitingQueue: departmentId ? store.getWaitingQueue(departmentId) : [],
    nextTokens: departmentId ? store.getNextTokensPreview(departmentId) : [],
    stats: departmentId ? store.getDepartmentStats(departmentId) : null,
    counters: departmentId ? store.getCountersForDepartment(departmentId) : [],
  };
}
