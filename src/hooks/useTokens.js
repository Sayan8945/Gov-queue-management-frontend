import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createTokenRequest,
  cancelTokenRequest,
  rescheduleTokenRequest,
  fetchTokensByCitizen,
} from '@/services/tokenService';

export function useCitizenTokens(citizenId) {
  return useQuery({
    queryKey: ['tokens', 'citizen', citizenId],
    queryFn: () => fetchTokensByCitizen(citizenId),
    enabled: Boolean(citizenId),
    refetchInterval: 5000,
  });
}

export function useCreateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTokenRequest,
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ['tokens', 'citizen', token.citizenId] });
      toast.success(`Token ${token.tokenNumber} booked successfully`);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create token');
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
      toast.error(error?.message || 'Failed to cancel token');
    },
  });
}

export function useRescheduleToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tokenId, newSlot }) => rescheduleTokenRequest(tokenId, newSlot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Token rescheduled');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to reschedule token');
    },
  });
}
