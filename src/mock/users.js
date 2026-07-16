// Mock user directory used by the simulated auth service
// TODO(backend): Replace with real authentication (JWT / sessions) against Express + MongoDB

import { ROLES } from '@/constants/roles';

export const mockUsers = [
  {
    id: 'citizen-1',
    name: 'Aditi Sharma',
    email: 'citizen@example.com',
    password: 'citizen123',
    role: ROLES.CITIZEN,
    phone: '+91 98765 43210',
  },
  {
    id: 'staff-1',
    name: 'Rahul Verma',
    email: 'staff@example.com',
    password: 'staff123',
    role: ROLES.STAFF,
    departmentId: 'dept-1',
    counterId: 'counter-1',
  },
  {
    id: 'staff-2',
    name: 'Priya Nair',
    email: 'staff2@example.com',
    password: 'staff123',
    role: ROLES.STAFF,
    departmentId: 'dept-2',
    counterId: 'counter-3',
  },
  {
    id: 'admin-1',
    name: 'Sanjay Mehta',
    email: 'admin@example.com',
    password: 'admin123',
    role: ROLES.ADMIN,
  },
];

export const findUserByEmail = (email) =>
  mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
