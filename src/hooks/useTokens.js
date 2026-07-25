import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createTokenRequest,
  cancelTokenRequest,
  rescheduleTokenRequest,
  fetchMyTokens,
  fetchTokenById,
  fetchQueueStatus,
} from '@/services/tokenService';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';

export function useMyTokens() {
  return useQuery({
    queryKey: ['tokens', 'my-tokens'],
    queryFn: fetchMyTokens,
    refetchInterval: 10000,
  });
}

export function useToken(tokenId) {
  return useQuery({
    queryKey: ['tokens', tokenId],
    queryFn: () => fetchTokenById(tokenId),
    enabled: Boolean(tokenId),
    refetchInterval: 10000,
  });
}

export function useQueueStatus(tokenId) {
  return useQuery({
    queryKey: ['queue', 'status', tokenId],
    queryFn: () => fetchQueueStatus(tokenId),
    enabled: Boolean(tokenId),
    refetchInterval: 10000,
  });
}

// Booking/cancel/reschedule actions also drop an entry into the citizen's
// own in-app notification center, alongside the toast, so they show up in
// /citizen/notifications as a persistent action log.
export function useCreateToken() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: createTokenRequest,
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      const message = `Token ${token.tokenNumber} booked successfully`;
      toast.success(message);
      addNotification({ recipientId: user?.id, title: 'Token booked', message, type: 'success', channel: 'push' });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create token');
    },
  });
}

export function useCancelToken() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: cancelTokenRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Token cancelled');
      addNotification({
        recipientId: user?.id,
        title: 'Token cancelled',
        message: 'Your token was cancelled.',
        type: 'info',
        channel: 'push',
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel token');
    },
  });
}

export function useRescheduleToken() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: ({ tokenId, bookingDate }) => rescheduleTokenRequest(tokenId, bookingDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Token rescheduled');
      addNotification({
        recipientId: user?.id,
        title: 'Token rescheduled',
        message: 'Your token has been rescheduled.',
        type: 'success',
        channel: 'push',
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reschedule token');
    },
  });
}
