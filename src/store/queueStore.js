import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCatalogStore } from '@/store/catalogStore';
import { useNotificationStore } from '@/store/notificationStore';
import { counters as seedCounters } from '@/mock/counters';
import { TOKEN_STATUS, PRIORITY_WEIGHT, PRIORITY_LEVELS, COUNTER_STATUS } from '@/constants/tokenStatus';
import { generateTokenId, generateTokenNumber } from '@/utils/tokenGenerator';

// This store is the heart of the frontend-only real-time simulation.
// TODO(backend): Once Express + Socket.IO backend exists, replace the in-memory
// mutations below with API calls + socket event listeners that sync server state.
// Keep the action names/signatures stable so the UI layer doesn't need to change.

const AVG_SERVICE_MINS_FALLBACK = 15;
const APPROACHING_TURN_POSITION_THRESHOLD = 3;

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function priorityThenFifo(a, b) {
  const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (weightDiff !== 0) return weightDiff;
  return new Date(a.createdAt) - new Date(b.createdAt);
}

function buildSeedTokens() {
  const catalog = useCatalogStore.getState();
  const departments = catalog.getAllDepartmentsWithServices();
  const now = Date.now();
  const names = ['Rohan Gupta', 'Sneha Iyer', 'Amit Kumar', 'Fatima Khan', 'Vikram Singh', 'Neha Joshi'];
  const seed = [];
  const dailySequences = {};
  let seq = 1;

  departments.forEach((dept, dIdx) => {
    const service = dept.services[0];
    if (!service) return;
    const count = dIdx === 0 ? 4 : 2;
    for (let i = 0; i < count; i += 1) {
      const createdAt = new Date(now - (count - i) * 5 * 60 * 1000).toISOString();
      seed.push({
        id: generateTokenId(),
        tokenNumber: generateTokenNumber(dept.code, seq),
        departmentId: dept.id,
        serviceId: service.id,
        citizenId: `seed-citizen-${dIdx}-${i}`,
        citizenName: names[(dIdx + i) % names.length],
        priority: i === 0 ? PRIORITY_LEVELS.SENIOR : PRIORITY_LEVELS.NORMAL,
        status: TOKEN_STATUS.WAITING,
        slot: createdAt,
        counterId: null,
        createdAt,
        calledAt: null,
        startedAt: null,
        completedAt: null,
        notifiedApproaching: false,
      });
      seq += 1;
    }
    dailySequences[`${dept.id}:${todayKey()}`] = count;
  });

  return { tokens: seed, dailySequences };
}

export const useQueueStore = create(
  persist(
    (set, get) => ({
      ...buildSeedTokens(),
      counters: seedCounters,
      announcements: [
        {
          id: 'ann-1',
          message: 'Welcome to the Citizen Service Center. Please keep your documents ready.',
          createdAt: new Date().toISOString(),
        },
      ],
      simulationIntervalId: null,

      // ---------- Selectors ----------
      getWaitingQueue: (departmentId) =>
        get()
          .tokens.filter((t) => t.departmentId === departmentId && t.status === TOKEN_STATUS.WAITING)
          .sort(priorityThenFifo),

      getTokenById: (tokenId) => get().tokens.find((t) => t.id === tokenId),

      getTokensByCitizen: (citizenId) =>
        get()
          .tokens.filter((t) => t.citizenId === citizenId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

      getPositionInQueue: (tokenId) => {
        const token = get().getTokenById(tokenId);
        if (!token || token.status !== TOKEN_STATUS.WAITING) return null;
        const queue = get().getWaitingQueue(token.departmentId);
        const idx = queue.findIndex((t) => t.id === tokenId);
        return idx === -1 ? null : idx + 1;
      },

      getEstimatedWaitMins: (tokenId) => {
        const token = get().getTokenById(tokenId);
        if (!token) return 0;
        const position = get().getPositionInQueue(tokenId);
        if (position === null) return 0;
        const service = useCatalogStore.getState().getServiceById(token.serviceId);
        const avgDuration = service?.durationMins || AVG_SERVICE_MINS_FALLBACK;
        const activeCounters = get().counters.filter(
          (c) => c.departmentId === token.departmentId && c.status === COUNTER_STATUS.ACTIVE
        ).length;
        const effectiveCounters = Math.max(activeCounters, 1);
        return Math.ceil((position / effectiveCounters) * avgDuration);
      },

      getCountersForDepartment: (departmentId) =>
        get().counters.filter((c) => c.departmentId === departmentId),

      getCounterById: (counterId) => get().counters.find((c) => c.id === counterId),

      getCurrentTokenForCounter: (counterId) => {
        const counter = get().counters.find((c) => c.id === counterId);
        if (!counter?.currentTokenId) return null;
        return get().getTokenById(counter.currentTokenId);
      },

      getNextTokensPreview: (departmentId, limit = 5) =>
        get().getWaitingQueue(departmentId).slice(0, limit),

      getDepartmentStats: (departmentId) => {
        const tokens = get().tokens.filter((t) => t.departmentId === departmentId);
        return {
          waiting: tokens.filter((t) => t.status === TOKEN_STATUS.WAITING).length,
          inProgress: tokens.filter((t) => t.status === TOKEN_STATUS.IN_PROGRESS).length,
          completed: tokens.filter((t) => t.status === TOKEN_STATUS.COMPLETED).length,
          skipped: tokens.filter((t) => t.status === TOKEN_STATUS.SKIPPED).length,
          cancelled: tokens.filter((t) => t.status === TOKEN_STATUS.CANCELLED).length,
          noShow: tokens.filter((t) => t.status === TOKEN_STATUS.NO_SHOW).length,
        };
      },

      getTokensIssuedToday: (departmentId) => {
        const key = todayKey();
        return get().tokens.filter(
          (t) => t.departmentId === departmentId && t.createdAt.slice(0, 10) === key
        ).length;
      },

      getRemainingCapacity: (departmentId) => {
        const dept = useCatalogStore.getState().getDepartmentById(departmentId);
        if (!dept) return 0;
        const issued = get().getTokensIssuedToday(departmentId);
        return Math.max(dept.tokenLimit - issued, 0);
      },

      // ---------- Reporting selectors ----------
      // TODO(backend): replace with GET /api/reports/* once historical data lives server-side.
      getAverageWaitMinutes: (departmentId) => {
        const tokens = get().tokens.filter(
          (t) =>
            (!departmentId || t.departmentId === departmentId) &&
            t.calledAt &&
            [TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_PROGRESS, TOKEN_STATUS.COMPLETED].includes(t.status)
        );
        if (tokens.length === 0) return 0;
        const totalMins = tokens.reduce((sum, t) => {
          const waitMs = new Date(t.calledAt) - new Date(t.createdAt);
          return sum + Math.max(waitMs / 60000, 0);
        }, 0);
        return Math.round(totalMins / tokens.length);
      },

      getTokensServedPerCounter: () => {
        const { tokens, counters } = get();
        return counters.map((counter) => ({
          counterId: counter.id,
          counterNumber: counter.number,
          served: tokens.filter((t) => t.counterId === counter.id && t.status === TOKEN_STATUS.COMPLETED)
            .length,
        }));
      },

      getPeakHoursHistogram: (departmentId) => {
        const tokens = get().tokens.filter((t) => !departmentId || t.departmentId === departmentId);
        const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
        tokens.forEach((t) => {
          const hour = new Date(t.createdAt).getHours();
          hours[hour].count += 1;
        });
        return hours;
      },

      // ---------- Notification helpers ----------
      // Notifies a waiting citizen once their position crosses the "approaching
      // turn" threshold. Called after any action that reshuffles a department's
      // queue so citizens are alerted in near-real-time (simulated).
      _checkApproachingTurnNotifications: (departmentId) => {
        const queue = get().getWaitingQueue(departmentId);
        const notifyStore = useNotificationStore.getState();
        const toNotify = queue
          .slice(0, APPROACHING_TURN_POSITION_THRESHOLD)
          .filter((t) => !t.notifiedApproaching);

        if (toNotify.length === 0) return;

        toNotify.forEach((t) => {
          notifyStore.addNotification({
            recipientId: t.citizenId,
            title: 'Your turn is approaching',
            message: `Token ${t.tokenNumber} — please be near the counter. Estimated wait: ${get().getEstimatedWaitMins(
              t.id
            )} min.`,
            type: 'warning',
            channel: 'sms',
          });
          notifyStore.addNotification({
            recipientId: t.citizenId,
            title: 'Your turn is approaching',
            message: `Token ${t.tokenNumber} is coming up soon.`,
            type: 'warning',
            channel: 'email',
          });
        });

        set((state) => ({
          tokens: state.tokens.map((t) =>
            toNotify.some((n) => n.id === t.id) ? { ...t, notifiedApproaching: true } : t
          ),
        }));
      },

      // ---------- Citizen actions ----------
      createToken: ({ departmentId, serviceId, citizenId, citizenName, priority, slot }) => {
        const catalog = useCatalogStore.getState();
        const dept = catalog.getDepartmentById(departmentId);
        if (!dept) throw new Error('Department not found');
        if (!dept.isActive) throw new Error('This department is currently not accepting tokens');

        const issuedToday = get().getTokensIssuedToday(departmentId);
        if (issuedToday >= dept.tokenLimit) {
          throw new Error(`Daily token limit reached for ${dept.name}. Please try again tomorrow.`);
        }

        // Conflict-free sequential allocation: each department gets an atomic,
        // monotonically increasing per-day sequence so two simultaneous bookings
        // can never receive the same token number.
        const seqKey = `${departmentId}:${todayKey()}`;
        const nextSeq = (get().dailySequences[seqKey] || 0) + 1;

        const token = {
          id: generateTokenId(),
          tokenNumber: generateTokenNumber(dept.code, nextSeq),
          departmentId,
          serviceId,
          citizenId,
          citizenName,
          priority: priority || PRIORITY_LEVELS.NORMAL,
          status: TOKEN_STATUS.WAITING,
          slot: slot || new Date().toISOString(),
          counterId: null,
          createdAt: new Date().toISOString(),
          calledAt: null,
          startedAt: null,
          completedAt: null,
          notifiedApproaching: false,
        };

        set((state) => ({
          tokens: [...state.tokens, token],
          dailySequences: { ...state.dailySequences, [seqKey]: nextSeq },
        }));

        const notifyStore = useNotificationStore.getState();
        notifyStore.addNotification({
          recipientId: citizenId,
          title: 'Token confirmed',
          message: `Your token ${token.tokenNumber} for ${dept.name} is confirmed.`,
          type: 'success',
          channel: 'sms',
        });
        notifyStore.addNotification({
          recipientId: citizenId,
          title: 'Token confirmed',
          message: `Your token ${token.tokenNumber} for ${dept.name} has been booked successfully. Scheduled: ${new Date(
            token.slot
          ).toLocaleString()}.`,
          type: 'success',
          channel: 'email',
        });

        return token;
      },

      cancelToken: (tokenId) => {
        const token = get().getTokenById(tokenId);
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId && t.status === TOKEN_STATUS.WAITING
              ? { ...t, status: TOKEN_STATUS.CANCELLED }
              : t
          ),
        }));
        if (token) get()._checkApproachingTurnNotifications(token.departmentId);
      },

      rescheduleToken: (tokenId, newSlot) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId && t.status === TOKEN_STATUS.WAITING ? { ...t, slot: newSlot } : t
          ),
        }));
        const token = get().getTokenById(tokenId);
        if (token) {
          useNotificationStore.getState().addNotification({
            recipientId: token.citizenId,
            title: 'Token rescheduled',
            message: `Token ${token.tokenNumber} has been rescheduled to ${new Date(newSlot).toLocaleString()}.`,
            type: 'info',
            channel: 'sms',
          });
        }
      },

      // ---------- Staff actions ----------
      callNextToken: (counterId) => {
        const counter = get().counters.find((c) => c.id === counterId);
        if (!counter || counter.status !== COUNTER_STATUS.ACTIVE) return null;
        const queue = get().getWaitingQueue(counter.departmentId);
        const next = queue[0];
        if (!next) return null;

        const now = new Date().toISOString();
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === next.id
              ? { ...t, status: TOKEN_STATUS.CALLED, counterId, calledAt: now }
              : t
          ),
          counters: state.counters.map((c) =>
            c.id === counterId ? { ...c, currentTokenId: next.id } : c
          ),
        }));

        useNotificationStore.getState().addNotification({
          recipientId: next.citizenId,
          title: "It's your turn",
          message: `Token ${next.tokenNumber} — please proceed to counter ${counter.number}.`,
          type: 'success',
          channel: 'sms',
        });

        get()._checkApproachingTurnNotifications(counter.departmentId);
        return next;
      },

      markInProgress: (tokenId) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId
              ? { ...t, status: TOKEN_STATUS.IN_PROGRESS, startedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      markCompleted: (tokenId) => {
        const token = get().getTokenById(tokenId);
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId
              ? { ...t, status: TOKEN_STATUS.COMPLETED, completedAt: new Date().toISOString() }
              : t
          ),
          counters: state.counters.map((c) =>
            c.id === token?.counterId ? { ...c, currentTokenId: null } : c
          ),
        }));
        if (token) get()._checkApproachingTurnNotifications(token.departmentId);
      },

      markSkipped: (tokenId) => {
        const token = get().getTokenById(tokenId);
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId ? { ...t, status: TOKEN_STATUS.SKIPPED } : t
          ),
          counters: state.counters.map((c) =>
            c.id === token?.counterId ? { ...c, currentTokenId: null } : c
          ),
        }));
        if (token) get()._checkApproachingTurnNotifications(token.departmentId);
      },

      // Exception handling: citizen was called but never showed up.
      markNoShow: (tokenId) => {
        const token = get().getTokenById(tokenId);
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId ? { ...t, status: TOKEN_STATUS.NO_SHOW } : t
          ),
          counters: state.counters.map((c) =>
            c.id === token?.counterId ? { ...c, currentTokenId: null } : c
          ),
        }));
        if (token) get()._checkApproachingTurnNotifications(token.departmentId);
      },

      requeueToken: (tokenId) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId
              ? { ...t, status: TOKEN_STATUS.WAITING, counterId: null, calledAt: null }
              : t
          ),
        }));
      },

      pauseCounter: (counterId) => {
        const counter = get().counters.find((c) => c.id === counterId);
        set((state) => ({
          counters: state.counters.map((c) =>
            c.id === counterId ? { ...c, status: COUNTER_STATUS.PAUSED } : c
          ),
        }));
        // Notify waiting citizens in this department of a possible delay.
        if (counter) {
          const waiting = get().getWaitingQueue(counter.departmentId);
          waiting.slice(0, 10).forEach((t) => {
            useNotificationStore.getState().addNotification({
              recipientId: t.citizenId,
              title: 'Possible delay',
              message: `Counter ${counter.number} has been paused. Your wait time may increase slightly.`,
              type: 'warning',
              channel: 'sms',
            });
          });
        }
      },

      resumeCounter: (counterId) => {
        set((state) => ({
          counters: state.counters.map((c) =>
            c.id === counterId ? { ...c, status: COUNTER_STATUS.ACTIVE } : c
          ),
        }));
      },

      assignStaffToCounter: (counterId, staffId) => {
        set((state) => ({
          counters: state.counters.map((c) =>
            c.id === counterId ? { ...c, staffId, status: COUNTER_STATUS.ACTIVE } : c
          ),
        }));
      },

      // Admin exception handling: move a waiting token to the front of its
      // department queue by escalating its priority to EMERGENCY, and notify
      // the citizen of a counter/queue change.
      expediteToken: (tokenId) => {
        const token = get().getTokenById(tokenId);
        if (!token || token.status !== TOKEN_STATUS.WAITING) return;
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === tokenId ? { ...t, priority: PRIORITY_LEVELS.EMERGENCY } : t
          ),
        }));
        useNotificationStore.getState().addNotification({
          recipientId: token.citizenId,
          title: 'Token expedited',
          message: `Token ${token.tokenNumber} has been marked urgent and moved up in the queue.`,
          type: 'info',
          channel: 'sms',
        });
        get()._checkApproachingTurnNotifications(token.departmentId);
      },

      // Reassign a waiting/called token to a different counter (e.g. original
      // counter went offline) and notify the citizen of the counter change.
      reassignTokenCounter: (tokenId, newCounterId) => {
        const token = get().getTokenById(tokenId);
        const newCounter = get().counters.find((c) => c.id === newCounterId);
        if (!token || !newCounter) return;
        set((state) => ({
          tokens: state.tokens.map((t) => (t.id === tokenId ? { ...t, counterId: newCounterId } : t)),
          counters: state.counters.map((c) => {
            if (c.id === newCounterId) return { ...c, currentTokenId: token.id };
            if (c.id === token.counterId) return { ...c, currentTokenId: null };
            return c;
          }),
        }));
        useNotificationStore.getState().addNotification({
          recipientId: token.citizenId,
          title: 'Counter changed',
          message: `Token ${token.tokenNumber} has been reassigned to counter ${newCounter.number}.`,
          type: 'warning',
          channel: 'sms',
        });
      },

      // ---------- Admin actions ----------
      addAnnouncement: (message) => {
        set((state) => ({
          announcements: [
            { id: `ann-${Date.now()}`, message, createdAt: new Date().toISOString() },
            ...state.announcements,
          ].slice(0, 10),
        }));
      },

      addCounter: (counter) => {
        set((state) => ({
          counters: [
            ...state.counters,
            { id: `counter-${Date.now()}`, currentTokenId: null, status: COUNTER_STATUS.OFFLINE, ...counter },
          ],
        }));
      },

      removeCounter: (counterId) => {
        set((state) => ({ counters: state.counters.filter((c) => c.id !== counterId) }));
      },

      // ---------- Simulation engine ----------
      // Periodically injects a new "walk-in" citizen token into a random active
      // department queue so dashboards, queue positions, and the TV display feel live.
      startAutoSimulation: () => {
        if (get().simulationIntervalId) return;
        const names = ['Arjun Rao', 'Divya Menon', 'Karan Malhotra', 'Isha Reddy', 'Farhan Ali', 'Meera Pillai'];
        const id = setInterval(() => {
          const activeDepts = useCatalogStore.getState().getActiveDepartments();
          if (activeDepts.length === 0) return;
          const dept = activeDepts[Math.floor(Math.random() * activeDepts.length)];
          const services = useCatalogStore.getState().getServicesByDepartment(dept.id);
          if (services.length === 0) return;
          const service = services[Math.floor(Math.random() * services.length)];
          const waitingCount = get().tokens.filter(
            (t) => t.departmentId === dept.id && t.status === TOKEN_STATUS.WAITING
          ).length;
          if (waitingCount >= 12) return; // cap queue growth for demo sanity
          try {
            get().createToken({
              departmentId: dept.id,
              serviceId: service.id,
              citizenId: `walkin-${Date.now()}`,
              citizenName: names[Math.floor(Math.random() * names.length)],
              priority: PRIORITY_LEVELS.NORMAL,
            });
          } catch {
            // Daily limit reached or department inactive — skip this tick.
          }
        }, 20000);
        set({ simulationIntervalId: id });
      },

      stopAutoSimulation: () => {
        const id = get().simulationIntervalId;
        if (id) clearInterval(id);
        set({ simulationIntervalId: null });
      },

      resetQueue: () => {
        get().stopAutoSimulation();
        set({ ...buildSeedTokens(), counters: seedCounters });
      },
    }),
    {
      name: 'gq_queue_storage',
      partialize: (state) => ({
        tokens: state.tokens,
        counters: state.counters,
        announcements: state.announcements,
        dailySequences: state.dailySequences,
      }),
    }
  )
);
