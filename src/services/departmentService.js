// Real department/service catalog API — backed entirely by MongoDB via the
// Express backend. No mock data, no frontend simulation.

import httpClient from './httpClient';

export const fetchDepartments = () => httpClient.get('/departments').then((r) => r.data.data);

export const fetchServicesByDepartment = (departmentId) =>
  httpClient.get(`/departments/${departmentId}/services`).then((r) => r.data.data);

export const fetchServiceAvailability = (serviceId) =>
  httpClient.get(`/services/${serviceId}/availability`).then((r) => r.data.data);

export const fetchCountersByDepartment = (departmentId) =>
  httpClient.get(`/departments/${departmentId}/counters`).then((r) => r.data.data);
