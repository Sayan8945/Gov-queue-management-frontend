import { clsx } from 'clsx';

/**
 * Small classnames helper. Wraps clsx so we have one place to swap
 * in tailwind-merge later if class conflicts become an issue.
 */
export function cn(...inputs) {
  return clsx(...inputs);
}
