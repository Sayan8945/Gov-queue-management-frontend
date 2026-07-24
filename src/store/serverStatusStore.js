import { create } from 'zustand';

// Tracks whether we're currently waiting on a slow/cold-starting backend so
// the UI can show a "please wait" banner instead of a request silently
// hanging. Render's free tier spins down an idle instance and the first
// request after that can take 30-60s to wake it back up.
// Not persisted — this is transient, per-session request state.
export const useServerStatusStore = create((set) => ({
  isWaking: false,
  attempt: 0,
  maxAttempts: 0,

  setWaking: (attempt, maxAttempts) => set({ isWaking: true, attempt, maxAttempts }),
  clearWaking: () => set({ isWaking: false, attempt: 0, maxAttempts: 0 }),
}));
