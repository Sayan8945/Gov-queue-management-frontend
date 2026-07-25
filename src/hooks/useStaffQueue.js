import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchCurrentQueue,
  callNextRequest,
  startServiceRequest,
  completeServiceRequest,
  skipTokenRequest,
  pauseCounterRequest,
  resumeCounterRequest,
} from '@/services/staffService';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';

const QUEUE_KEY = ['staff', 'current-queue'];

/**
 * The staff dashboard's single source of truth: assigned counter,
 * department, current token, waiting queue, and today's stats — all read
 * straight from MongoDB via GET /api/staff/current-queue. Polls every 5s so
 * the dashboard feels live without needing Socket.IO wired up yet.
 */
export function useStaffQueue() {
  return useQuery({
    queryKey: QUEUE_KEY,
    queryFn: fetchCurrentQueue,
    refetchInterval: 5000,
  });
}

// Every queue action a staff member takes also lands in their own in-app
// notification center, so /staff/notifications shows a running log of
// calls, completions, skips, and counter pause/resume actions.
function useStaffQueueMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      if (successMessage) {
        toast.success(successMessage);
        addNotification({
          recipientId: user?.id,
          title: 'Action completed',
          message: successMessage,
          type: 'success',
          channel: 'push',
        });
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Action failed');
    },
  });
}

export function useCallNext() {
  return useStaffQueueMutation(callNextRequest, 'Next token called');
}

export function useStartService() {
  return useStaffQueueMutation(startServiceRequest, 'Service started');
}

export function useCompleteService() {
  return useStaffQueueMutation(completeServiceRequest, 'Token marked completed');
}

export function useSkipToken() {
  return useStaffQueueMutation(({ tokenId, reason }) => skipTokenRequest(tokenId, reason), 'Token skipped');
}

export function usePauseCounter() {
  return useStaffQueueMutation(pauseCounterRequest, 'Counter paused');
}

export function useResumeCounter() {
  return useStaffQueueMutation(resumeCounterRequest, 'Counter resumed');
}
