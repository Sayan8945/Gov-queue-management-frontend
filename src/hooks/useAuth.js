import { useAuthStore } from '@/store/authStore';

/**
 * Thin convenience wrapper around the auth store, kept as a hook so
 * components don't need to know it's Zustand under the hood.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pendingVerification = useAuthStore((s) => s.pendingVerification);
  const pendingPasswordReset = useAuthStore((s) => s.pendingPasswordReset);
  const demoSession = useAuthStore((s) => s.demoSession);
  const login = useAuthStore((s) => s.login);
  const registerCitizen = useAuthStore((s) => s.registerCitizen);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const verifyPasswordResetOtp = useAuthStore((s) => s.verifyPasswordResetOtp);
  const completePasswordReset = useAuthStore((s) => s.completePasswordReset);
  const resendPasswordResetOtp = useAuthStore((s) => s.resendPasswordResetOtp);
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    isAuthenticated,
    pendingVerification,
    pendingPasswordReset,
    demoSession,
    login,
    registerCitizen,
    verifyEmail,
    resendOtp,
    requestPasswordReset,
    verifyPasswordResetOtp,
    completePasswordReset,
    resendPasswordResetOtp,
    loginDemo,
    logout,
  };
}
