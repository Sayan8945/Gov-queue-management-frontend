import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// In-app notification center store (separate from toast popups). Each
// notification simulates delivery over one or more channels (SMS/Email/Push)
// per the "Receive SMS/Email notifications" requirement. Since there's no real
// SMS/Email gateway on the frontend, `channel` is metadata only — the actual
// "delivery" is the in-app entry plus a toast triggered by the caller.
// TODO(backend): sync with server-pushed notifications over Socket.IO, and
// wire `channel` up to a real SMS/Email provider (e.g. Twilio, SES).

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],

      /**
       * @param {object} params
       * @param {string} [params.recipientId] - target user id (citizen-specific). Omit for role broadcasts.
       * @param {string} [params.recipientRole] - target role ('citizen'|'staff'|'admin') when recipientId is omitted.
       * @param {string} params.title
       * @param {string} params.message
       * @param {'info'|'success'|'warning'|'danger'} [params.type]
       * @param {'sms'|'email'|'push'} [params.channel]
       */
      addNotification: ({ recipientId, recipientRole, title, message, type = 'info', channel = 'push' }) => {
        const notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          recipientId: recipientId || null,
          recipientRole: recipientRole || null,
          title,
          message,
          type,
          channel,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 100) }));
        return notification;
      },

      getForUser: (user) => {
        if (!user) return [];
        return get().notifications.filter(
          (n) => n.recipientId === user.id || (!n.recipientId && n.recipientRole === user.role)
        );
      },

      unreadCountForUser: (user) => get().getForUser(user).filter((n) => !n.read).length,

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllAsReadForUser: (user) => {
        const ids = new Set(get().getForUser(user).map((n) => n.id));
        set((state) => ({
          notifications: state.notifications.map((n) => (ids.has(n.id) ? { ...n, read: true } : n)),
        }));
      },

      clearAllForUser: (user) => {
        const ids = new Set(get().getForUser(user).map((n) => n.id));
        set((state) => ({ notifications: state.notifications.filter((n) => !ids.has(n.id)) }));
      },
    }),
    { name: 'gq_notifications_storage' }
  )
);
