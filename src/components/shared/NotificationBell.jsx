import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks/useAuth';
import { relativeTime } from '@/utils/dateHelpers';
import EmptyState from '@/components/ui/EmptyState';

const CHANNEL_ICON = { sms: MessageSquare, email: Mail, push: Smartphone };

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const notifications = useNotificationStore((s) => s.getForUser(user));
  const markAllAsReadForUser = useNotificationStore((s) => s.markAllAsReadForUser);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const ref = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsReadForUser(user)}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4">
                  <EmptyState title="No notifications" description="You're all caught up." />
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => {
                    const ChannelIcon = CHANNEL_ICON[n.channel] || Smartphone;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => markAsRead(n.id)}
                          className={`w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/50 ${
                            !n.read ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <ChannelIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                              <p className="mt-1 text-xs text-gray-400">{relativeTime(n.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
