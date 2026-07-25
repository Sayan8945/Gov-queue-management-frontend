import { Bell, CheckCheck, Trash2, Mail, MessageSquare, Smartphone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks/useAuth';
import { relativeTime } from '@/utils/dateHelpers';
import { cn } from '@/utils/cn';

const CHANNEL_ICON = { sms: MessageSquare, email: Mail, push: Smartphone };
const CHANNEL_LABEL = { sms: 'SMS', email: 'Email', push: 'App' };

export default function NotificationsPage() {
  const { user } = useAuth();
  const notifications = useNotificationStore((s) => s.getForUser(user));
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsReadForUser = useNotificationStore((s) => s.markAllAsReadForUser);
  const clearAllForUser = useNotificationStore((s) => s.clearAllForUser);

  return (
    <div>
      <PageHeader
        title="Notification Center"
        description="Every action and alert sent to your account, including anything delivered via SMS/Email."
        breadcrumbItems={[{ label: 'Notifications' }]}
        actions={
          notifications.length > 0 && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={CheckCheck} onClick={() => markAllAsReadForUser(user)}>
                Mark all read
              </Button>
              <Button variant="outline" size="sm" icon={Trash2} onClick={() => clearAllForUser(user)}>
                Clear all
              </Button>
            </div>
          )
        }
      />

      <Card>
        {notifications.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((n) => {
              const ChannelIcon = CHANNEL_ICON[n.channel] || Smartphone;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      'flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40',
                      !n.read && 'bg-primary-50/50 dark:bg-primary-950/20'
                    )}
                  >
                    <div
                      className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-600"
                      style={{ opacity: n.read ? 0 : 1 }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                        <Badge variant="default" className="gap-1">
                          <ChannelIcon className="h-3 w-3" /> {CHANNEL_LABEL[n.channel] || 'App'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                      <p className="mt-1 text-xs text-gray-400">{relativeTime(n.createdAt)}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
