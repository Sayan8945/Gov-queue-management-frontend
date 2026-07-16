// Simulated HTTP client used by the mock API layer.
// TODO(backend): Delete this file once real endpoints exist and switch services/*.js
// over to use src/services/httpClient.js (axios instance) exclusively.

const NETWORK_DELAY_MS = 400;

/**
 * Simulates a network round trip so loading states/skeletons behave
 * realistically even against local mock data.
 */
export function simulateRequest(payload, { delay = NETWORK_DELAY_MS, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        reject(new Error('Simulated network error. Please try again.'));
        return;
      }
      resolve(payload);
    }, delay);
  });
}
