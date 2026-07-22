// Real API client for authentication + email OTP verification.
// Wraps httpClient calls to the Express backend's /api/auth/* endpoints.

import httpClient from './httpClient';

/**
 * Registers a new citizen. The account is created unverified and an OTP is
 * emailed — no tokens are issued yet.
 * @returns {Promise<{citizenId: string, email: string, message: string, expiresInMinutes: number}>}
 */
export async function registerCitizen({ fullName, mobileNumber, email, password }) {
  const { data } = await httpClient.post('/auth/register', { fullName, mobileNumber, email, password });
  return { ...data.data, message: data.message };
}

/**
 * Verifies a citizen's email OTP. On success the backend returns the
 * authenticated user plus an access/refresh token pair.
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 */
export async function verifyEmailOtp({ citizenId, otp }) {
  const { data } = await httpClient.post('/auth/verify-email', { citizenId, otp });
  return data.data;
}

/**
 * Requests a new OTP be emailed to the given address, subject to a
 * server-side cooldown. Never reveals whether the account exists.
 * @returns {Promise<{message: string}>}
 */
export async function resendOtp(email) {
  const { data } = await httpClient.post('/auth/resend-otp', { email });
  return { message: data.message };
}

/**
 * Logs in a citizen or staff/admin user.
 * @param {{identifier: string, password: string, role?: 'citizen'|'staff'}} credentials
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 */
export async function login({ identifier, password, role = 'citizen' }) {
  const { data } = await httpClient.post('/auth/login', { identifier, password, role });
  return data.data;
}

export async function logout(refreshToken) {
  await httpClient.post('/auth/logout', { refreshToken });
}
