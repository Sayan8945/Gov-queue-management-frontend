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

export function useCreateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTokenRequest,
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success(`Token ${token.tokenNumber} booked successfully`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create token');
    },
  });
}

export function useCancelToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelTokenRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Token cancelled');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel token');
    },
  });
}

export function useRescheduleToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tokenId, bookingDate }) => rescheduleTokenRequest(tokenId, bookingDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Token rescheduled');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reschedule token');
    },
  });
}
