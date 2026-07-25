// Lightweight heuristic password strength scorer — no external dependency.
// Returns a 0-4 score plus a human label, based on length and character
// class diversity. Not a substitute for the backend's own validation
// (Zod schemas), just a UX signal for the user while typing.

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', percent: 0 };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const clamped = Math.min(score, 4);
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-danger-500', 'bg-danger-500', 'bg-warning-500', 'bg-success-500', 'bg-success-600'];

  return {
    score: clamped,
    label: labels[clamped],
    color: colors[clamped],
    percent: (clamped / 4) * 100,
  };
}
