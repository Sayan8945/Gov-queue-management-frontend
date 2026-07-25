// Real token/queue API — backed entirely by MongoDB via the Express
// backend. No mock data, no frontend simulation.

import httpClient from './httpClient';

export const createTokenRequest = ({ departmentId, serviceId, priorityType }) =>
  httpClient.post('/tokens', { departmentId, serviceId, priorityType }).then((r) => r.data.data);

export const cancelTokenRequest = (tokenId) =>
  httpClient.put(`/tokens/${tokenId}/cancel`).then((r) => r.data.data);

export const rescheduleTokenRequest = (tokenId, bookingDate) =>
  httpClient.put(`/tokens/${tokenId}/reschedule`, { bookingDate }).then((r) => r.data.data);

export const fetchMyTokens = () => httpClient.get('/tokens/my-tokens').then((r) => r.data.data);

export const fetchTokenById = (tokenId) => httpClient.get(`/tokens/${tokenId}`).then((r) => r.data.data);

export const fetchQueueStatus = (tokenId) =>
  httpClient.get(`/queue/status/${tokenId}`).then((r) => r.data.data);

export const fetchDepartmentQueue = (departmentId) =>
  httpClient.get(`/queue/department/${departmentId}`).then((r) => r.data.data);
