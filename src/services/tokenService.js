// Mock token API that wraps the queueStore so React Query can cache/invalidate
// consistently. The store remains the single source of truth for live state.
// TODO(backend): swap these for real REST + Socket.IO event driven calls.

import { useQueueStore } from '@/store/queueStore';
import { simulateRequest } from './mockApiClient';

export const createTokenRequest = (payload) =>
  simulateRequest(null).then(() => useQueueStore.getState().createToken(payload));

export const cancelTokenRequest = (tokenId) =>
  simulateRequest(null).then(() => useQueueStore.getState().cancelToken(tokenId));

export const rescheduleTokenRequest = (tokenId, newSlot) =>
  simulateRequest(null).then(() => useQueueStore.getState().rescheduleToken(tokenId, newSlot));

export const fetchTokensByCitizen = (citizenId) =>
  simulateRequest(null).then(() => useQueueStore.getState().getTokensByCitizen(citizenId));

export const fetchTokenById = (tokenId) =>
  simulateRequest(null).then(() => useQueueStore.getState().getTokenById(tokenId));
