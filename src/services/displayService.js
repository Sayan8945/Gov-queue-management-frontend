// Real, unauthenticated public display-board API — backed by MongoDB via
// the Express backend. No mock data.

import axios from 'axios';

// Deliberately a plain axios instance, not the shared httpClient — the
// display board is unauthenticated and must never attach a Bearer token.
const displayHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

export const fetchDisplayDepartments = () =>
  displayHttp.get('/display-board/departments').then((r) => r.data.data);

export const fetchDepartmentDisplay = (departmentId) =>
  displayHttp.get(`/display-board/departments/${departmentId}`).then((r) => r.data.data);
