import { useAuthStore } from '@/store/authStore';

/**
 * Thin convenience wrapper around the auth store, kept as a hook so
 * components don't need to know it's Zustand under the hood.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pendingVerification = useAuthStore((s) => s.pendingVerification);
  const login = useAuthStore((s) => s.login);
  const registerCitizen = useAuthStore((s) => s.registerCitizen);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    isAuthenticated,
    pendingVerification,
    login,
    registerCitizen,
    verifyEmail,
    resendOtp,
    logout,
  };
}
