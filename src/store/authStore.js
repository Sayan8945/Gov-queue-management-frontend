import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '@/services/authService';

// Normalizes the backend's Mongoose user document (fullName/mobileNumber/_id)
// into the shape the rest of the frontend already expects (name/phone/id),
// so existing components (Topbar, ProfilePage, etc.) don't need to change.
function normalizeUser(rawUser) {
  if (!rawUser) return null;
  return {
    ...rawUser,
    id: rawUser._id || rawUser.id,
    name: rawUser.fullName || rawUser.name,
    phone: rawUser.mobileNumber || rawUser.phone,
  };
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      // Set while a citizen has registered/attempted login but not yet
      // verified their email, so /verify-email can be reloaded/refreshed
      // without losing context.
      pendingVerification: null, // { citizenId, email }

      login: async (identifier, password, role) => {
        try {
          const { user, accessToken, refreshToken } = await authService.login({
            identifier,
            password,
            role,
          });
          const safeUser = normalizeUser(user);
          set({
            user: safeUser,
            isAuthenticated: true,
            accessToken,
            refreshToken,
            pendingVerification: null,
          });
          localStorage.setItem('gq_auth_token', accessToken);
          return safeUser;
        } catch (error) {
          const details = error.response?.data?.details;
          if (details?.verified === false) {
            set({ pendingVerification: { citizenId: details.citizenId, email: details.email } });
          }
          // No response at all means the request never reached the server
          // (timeout, network drop, or the cold-start retries in httpClient
          // were exhausted) — preserve that distinction so the UI can show
          // a "server unreachable, try again" message instead of a generic
          // credentials error.
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Invalid email or password'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      registerCitizen: async ({ name, fullName, email, phone, mobileNumber, password }) => {
        try {
          const result = await authService.registerCitizen({
            fullName: fullName || name,
            mobileNumber: mobileNumber || phone,
            email,
            password,
          });
          set({ pendingVerification: { citizenId: result.citizenId, email: result.email } });
          return result;
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Registration failed'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      verifyEmail: async (otp) => {
        const pending = get().pendingVerification;
        if (!pending?.citizenId) {
          throw new Error('No pending verification. Please register or log in again.');
        }
        try {
          const { user, accessToken, refreshToken } = await authService.verifyEmailOtp({
            citizenId: pending.citizenId,
            otp,
          });
          const safeUser = normalizeUser(user);
          set({
            user: safeUser,
            isAuthenticated: true,
            accessToken,
            refreshToken,
            pendingVerification: null,
          });
          localStorage.setItem('gq_auth_token', accessToken);
          return safeUser;
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Verification failed'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      resendOtp: async () => {
        const pending = get().pendingVerification;
        if (!pending?.email) {
          throw new Error('No pending verification. Please register or log in again.');
        }
        try {
          return await authService.resendOtp(pending.email);
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Failed to resend code'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      // Set while a password-reset OTP has been requested but not yet
      // verified/consumed, so /reset-password can be reloaded without
      // losing the email context.
      pendingPasswordReset: null, // { email }

      // Demo Mode session info, used by the DemoBanner/DemoSessionBadge to
      // show a countdown and label. Not a real distinct auth mechanism —
      // the user is authenticated with a completely normal JWT; this is
      // just UI metadata about when that demo session started.
      demoSession: null, // { role, startedAt }

      requestPasswordReset: async (email) => {
        try {
          const result = await authService.forgotPassword(email);
          set({ pendingPasswordReset: { email } });
          return result;
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Failed to send reset code'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      verifyPasswordResetOtp: async (otp) => {
        const pending = get().pendingPasswordReset;
        if (!pending?.email) {
          throw new Error('No pending password reset. Please start again.');
        }
        try {
          const result = await authService.verifyResetOtp({ email: pending.email, otp });
          // Remember the verified code so ResetPasswordPage can submit it
          // together with the new password without asking the user to
          // re-enter it. The backend re-verifies it anyway on actual reset.
          set({ pendingPasswordReset: { ...pending, verifiedOtp: otp } });
          return result;
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Incorrect verification code'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      completePasswordReset: async (password) => {
        const pending = get().pendingPasswordReset;
        if (!pending?.email || !pending?.verifiedOtp) {
          throw new Error('No verified reset code found. Please start again.');
        }
        try {
          const result = await authService.resetPassword({
            email: pending.email,
            otp: pending.verifiedOtp,
            password,
          });
          set({ pendingPasswordReset: null });
          return result;
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Failed to reset password'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      loginDemo: async (role) => {
        try {
          const result = await authService.demoLogin(role);

          if (role === 'display') {
            // No account/session — public/unauthenticated view.
            return { role: 'display' };
          }

          const safeUser = normalizeUser(result.user);
          set({
            user: safeUser,
            isAuthenticated: true,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            pendingVerification: null,
            demoSession: { role, startedAt: Date.now() },
          });
          localStorage.setItem('gq_auth_token', result.accessToken);
          return safeUser;
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Failed to start demo session'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      resendPasswordResetOtp: async () => {
        const pending = get().pendingPasswordReset;
        if (!pending?.email) {
          throw new Error('No pending password reset. Please start again.');
        }
        try {
          return await authService.forgotPassword(pending.email);
        } catch (error) {
          const isNetworkFailure = !error.response;
          const wrapped = new Error(
            isNetworkFailure
              ? 'Could not reach the server. Please wait a moment and try again.'
              : error.response?.data?.message || 'Failed to resend code'
          );
          wrapped.isNetworkFailure = isNetworkFailure;
          throw wrapped;
        }
      },

      logout: () => {
        const { refreshToken } = get();
        authService.logout(refreshToken).catch(() => {
          // Ignore network errors on logout — client-side state is cleared regardless.
        });
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, demoSession: null });
        localStorage.removeItem('gq_auth_token');
      },

      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: 'gq_auth_storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        pendingVerification: state.pendingVerification,
        pendingPasswordReset: state.pendingPasswordReset,
        demoSession: state.demoSession,
      }),
    }
  )
);
