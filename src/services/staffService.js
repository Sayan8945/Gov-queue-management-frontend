// Real staff dashboard/queue-operations API — backed entirely by MongoDB
// via the Express backend. No mock data, no frontend simulation.

import httpClient from './httpClient';

export const fetchOwnProfile = () => httpClient.get('/staff/me').then((r) => r.data.data);

export const fetchAssignedCounter = () => httpClient.get('/staff/assigned-counter').then((r) => r.data.data);

export const fetchCurrentQueue = () => httpClient.get('/staff/current-queue').then((r) => r.data.data);

export const callNextRequest = (counterId) =>
  httpClient.post('/staff/call-next', { counterId }).then((r) => r.data.data);

export const startServiceRequest = (tokenId) =>
  httpClient.post('/staff/start-service', { tokenId }).then((r) => r.data.data);

export const completeServiceRequest = (tokenId) =>
  httpClient.post('/staff/complete-service', { tokenId }).then((r) => r.data.data);

export const skipTokenRequest = (tokenId, reason) =>
  httpClient.post('/staff/skip-token', { tokenId, reason }).then((r) => r.data.data);

export const pauseCounterRequest = (counterId) =>
  httpClient.post('/staff/pause-counter', { counterId }).then((r) => r.data.data);

export const resumeCounterRequest = (counterId) =>
  httpClient.post('/staff/resume-counter', { counterId }).then((r) => r.data.data);
