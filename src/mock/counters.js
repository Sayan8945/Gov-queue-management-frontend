// Mock counter seed data
// TODO(backend): Replace with GET /api/counters from Express/MongoDB service

import { COUNTER_STATUS } from '@/constants/tokenStatus';

export const counters = [
  {
    id: 'counter-1',
    number: 'C-01',
    departmentId: 'dept-1',
    staffId: 'staff-1',
    status: COUNTER_STATUS.ACTIVE,
    currentTokenId: null,
  },
  {
    id: 'counter-2',
    number: 'C-02',
    departmentId: 'dept-1',
    staffId: null,
    status: COUNTER_STATUS.OFFLINE,
    currentTokenId: null,
  },
  {
    id: 'counter-3',
    number: 'C-03',
    departmentId: 'dept-2',
    staffId: 'staff-2',
    status: COUNTER_STATUS.ACTIVE,
    currentTokenId: null,
  },
  {
    id: 'counter-4',
    number: 'C-04',
    departmentId: 'dept-3',
    staffId: null,
    status: COUNTER_STATUS.OFFLINE,
    currentTokenId: null,
  },
  {
    id: 'counter-5',
    number: 'C-05',
    departmentId: 'dept-4',
    staffId: null,
    status: COUNTER_STATUS.OFFLINE,
    currentTokenId: null,
  },
  {
    id: 'counter-6',
    number: 'C-06',
    departmentId: 'dept-5',
    staffId: null,
    status: COUNTER_STATUS.OFFLINE,
    currentTokenId: null,
  },
];

export const getCounterById = (id) => counters.find((c) => c.id === id);
export const getCountersByDepartment = (deptId) =>
  counters.filter((c) => c.departmentId === deptId);
