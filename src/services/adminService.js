// Real admin CRUD API — backed entirely by MongoDB via the Express
// backend's /api/admin/* routes. No mock data, no frontend simulation.

import httpClient from './httpClient';

// ---------- Departments ----------
export const fetchAllDepartments = () => httpClient.get('/admin/departments').then((r) => r.data.data);
export const createDepartment = (payload) => httpClient.post('/admin/departments', payload).then((r) => r.data.data);
export const updateDepartment = (id, payload) =>
  httpClient.put(`/admin/departments/${id}`, payload).then((r) => r.data.data);
export const deleteDepartment = (id) => httpClient.delete(`/admin/departments/${id}`).then((r) => r.data);

// ---------- Services ----------
export const fetchAllServices = () => httpClient.get('/admin/services').then((r) => r.data.data);
export const createService = (payload) => httpClient.post('/admin/services', payload).then((r) => r.data.data);
export const updateService = (id, payload) =>
  httpClient.put(`/admin/services/${id}`, payload).then((r) => r.data.data);
export const deleteService = (id) => httpClient.delete(`/admin/services/${id}`).then((r) => r.data);

// ---------- Counters ----------
export const fetchAllCounters = () => httpClient.get('/admin/counters').then((r) => r.data.data);
export const createCounter = (payload) => httpClient.post('/admin/counters', payload).then((r) => r.data.data);
export const updateCounter = (id, payload) =>
  httpClient.put(`/admin/counters/${id}`, payload).then((r) => r.data.data);
export const deleteCounter = (id) => httpClient.delete(`/admin/counters/${id}`).then((r) => r.data);
export const assignStaffToCounter = (counterId, staffId) =>
  httpClient.put(`/admin/counters/${counterId}/assign-staff`, { staffId }).then((r) => r.data.data);

// ---------- Staff ----------
export const fetchAllStaff = () => httpClient.get('/admin/staff').then((r) => r.data.data);
export const createStaff = (payload) => httpClient.post('/admin/staff', payload).then((r) => r.data.data);
export const updateStaff = (id, payload) => httpClient.put(`/admin/staff/${id}`, payload).then((r) => r.data.data);
export const deactivateStaff = (id) => httpClient.put(`/admin/staff/${id}/deactivate`).then((r) => r.data.data);
export const activateStaff = (id) => httpClient.put(`/admin/staff/${id}/activate`).then((r) => r.data.data);
export const deleteStaff = (id) => httpClient.delete(`/admin/staff/${id}`).then((r) => r.data);

// ---------- Analytics ----------
export const fetchWaitTimesAnalytics = (params) =>
  httpClient.get('/admin/analytics/wait-times', { params }).then((r) => r.data.data);
export const fetchPeakHoursAnalytics = (params) =>
  httpClient.get('/admin/analytics/peak-hours', { params }).then((r) => r.data.data);
export const fetchCounterPerformance = (params) =>
  httpClient.get('/admin/analytics/counter-performance', { params }).then((r) => r.data.data);
export const fetchDepartmentPerformance = (params) =>
  httpClient.get('/admin/analytics/department-performance', { params }).then((r) => r.data.data);
export const fetchServiceDemandTrends = (params) =>
  httpClient.get('/admin/analytics/service-demand', { params }).then((r) => r.data.data);
export const fetchDailyTokensServed = (params) =>
  httpClient.get('/admin/analytics/daily-tokens-served', { params }).then((r) => r.data.data);

// ---------- Priority Queue ----------
export const fetchAllWaitingTokens = () => httpClient.get('/admin/priority-queue').then((r) => r.data.data);
export const expediteToken = (tokenId) =>
  httpClient.put(`/admin/priority-queue/${tokenId}/expedite`).then((r) => r.data.data);
