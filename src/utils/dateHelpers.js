import { format, formatDistanceToNow, addMinutes, isToday } from 'date-fns';

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '';
  return format(new Date(date), pattern);
}

export function formatTime(date, pattern = 'hh:mm a') {
  if (!date) return '';
  return format(new Date(date), pattern);
}

export function formatDateTime(date) {
  if (!date) return '';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
}

export function relativeTime(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function addMinutesToDate(date, mins) {
  return addMinutes(new Date(date), mins);
}

export function isSlotToday(date) {
  return isToday(new Date(date));
}

/**
 * Generates 30-minute slot options for a given date between open and close hours.
 */
export function generateTimeSlots(date, openHour = 9, closeHour = 17, stepMins = 30) {
  const slots = [];
  const base = new Date(date);
  base.setHours(openHour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(closeHour, 0, 0, 0);

  let cursor = base;
  while (cursor < end) {
    slots.push(new Date(cursor));
    cursor = addMinutes(cursor, stepMins);
  }
  return slots;
}
