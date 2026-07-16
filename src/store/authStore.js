import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { findUserByEmail } from '@/mock/users';

// TODO(backend): replace this simulated auth with real JWT-based auth against
// POST /api/auth/login, POST /api/auth/register, etc.

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const found = findUserByEmail(email);
        if (!found || found.password !== password) {
          throw new Error('Invalid email or password');
        }
        const safeUser = { ...found };
        delete safeUser.password;
        set({ user: safeUser, isAuthenticated: true });
        localStorage.setItem('gq_auth_token', `mock-token-${safeUser.id}`);
        return safeUser;
      },

      registerCitizen: async ({ name, email, phone, password: _password }) => {
        const existing = findUserByEmail(email);
        if (existing) {
          throw new Error('An account with this email already exists');
        }
        const newUser = {
          id: `citizen-${Date.now()}`,
          name,
          email,
          phone,
          role: 'citizen',
        };
        set({ user: newUser, isAuthenticated: true });
        localStorage.setItem('gq_auth_token', `mock-token-${newUser.id}`);
        return newUser;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('gq_auth_token');
      },

      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: 'gq_auth_storage',
    }
  )
);
