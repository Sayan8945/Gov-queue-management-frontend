import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getCitizenSocket, getStaffSocket, disconnectAllSockets } from '@/services/socketClient';
import { useNotificationStore } from '@/store/notificationStore';

/**
 * Connects the appropriate authenticated Socket.IO namespace (citizen or
 * staff/admin) for the logged-in user and invalidates the relevant React
 * Query caches whenever the backend emits a real-time event, so booking a
 * token, calling next, completing service, etc. propagate live to every
 * open screen without polling alone. Replaces the old frontend-only
 * queueStore timer simulation entirely.
 */
export function useRealtimeSync() {
  const { isAuthenticated, user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!isAuthenticated || !user || !accessToken) {
      disconnectAllSockets();
      return undefined;
    }

    const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin' || user.role === 'super_admin';
    const socket = isStaffOrAdmin ? getStaffSocket(accessToken) : getCitizenSocket(accessToken);
    socket.connect();

    const invalidateTokens = () => queryClient.invalidateQueries({ queryKey: ['tokens'] });
    const invalidateStaffQueue = () => queryClient.invalidateQueries({ queryKey: ['staff', 'current-queue'] });

    if (isStaffOrAdmin) {
      socket.on('nextTokenAssigned', invalidateStaffQueue);
      socket.on('queuePaused', invalidateStaffQueue);
      socket.on('counterResumed', invalidateStaffQueue);
      socket.on('counterAssigned', (payload) => {
        invalidateStaffQueue();
        addNotification({
          recipientId: user.id,
          title: 'Counter Assigned',
          message: `You've been assigned to counter ${payload.counterNumber} in ${payload.departmentName || 'a department'}.`,
          type: 'success',
          channel: 'push',
        });
      });
    } else {
      socket.on('queueUpdated', invalidateTokens);
      socket.on('turnApproaching', invalidateTokens);
      socket.on('tokenCalled', invalidateTokens);
      socket.on('serviceCompleted', invalidateTokens);
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [isAuthenticated, user, accessToken, queryClient, addNotification]);
}
