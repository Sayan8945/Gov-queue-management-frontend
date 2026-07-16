import { useAuthStore } from '@/store/authStore';

/**
 * Thin convenience wrapper around the auth store, kept as a hook so
 * components don't need to know it's Zustand under the hood. This also
 * gives us one seam to swap in a context-based auth provider later if
 * the real backend requires token refresh logic, etc.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const registerCitizen = useAuthStore((s) => s.registerCitizen);
  const logout = useAuthStore((s) => s.logout);

  return { user, isAuthenticated, login, registerCitizen, logout };
}
