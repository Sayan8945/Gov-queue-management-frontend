import axios from 'axios';
import { useServerStatusStore } from '@/store/serverStatusStore';

// Render's free tier spins down an idle backend instance, so the first
// request after a period of inactivity can hang for 30-60s while it wakes
// back up (rather than failing fast). We use a longer timeout than usual
// and automatically retry timeouts/network errors/502/503 with backoff,
// surfacing a "server is waking up" state via serverStatusStore so the UI
// can show a please-wait message instead of looking frozen or broken.
const COLD_START_MAX_RETRIES = 3;
const COLD_START_RETRY_DELAY_MS = 5000;

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gq_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isColdStartCandidate(error) {
  // No response at all (timeout, network drop) or a gateway error, which is
  // what Render tends to return while an instance is still spinning up.
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

httpClient.interceptors.response.use(
  (response) => {
    useServerStatusStore.getState().clearWaking();
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const retryCount = config.__coldStartRetryCount || 0;

    if (isColdStartCandidate(error) && retryCount < COLD_START_MAX_RETRIES) {
      const nextAttempt = retryCount + 1;
      useServerStatusStore.getState().setWaking(nextAttempt, COLD_START_MAX_RETRIES);
      await wait(COLD_START_RETRY_DELAY_MS);
      config.__coldStartRetryCount = nextAttempt;
      return httpClient(config);
    }

    useServerStatusStore.getState().clearWaking();
    return Promise.reject(error);
  }
);

export default httpClient;
