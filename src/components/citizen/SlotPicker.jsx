import { generateTimeSlots, formatTime } from '@/utils/dateHelpers';
import { cn } from '@/utils/cn';

export default function SlotPicker({ date, selectedSlot, onSelect, operatingHours }) {
  const { openHour = 9, closeHour = 17, slotMins = 30 } = operatingHours || {};
  const slots = generateTimeSlots(date, openHour, closeHour, slotMins);

  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">No slots available for this date.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selectedSlot && new Date(selectedSlot).getTime() === slot.getTime();
        const isPast = slot.getTime() < Date.now();
        return (
          <button
            key={slot.toISOString()}
            type="button"
            disabled={isPast}
            onClick={() => onSelect(slot.toISOString())}
            aria-pressed={isSelected}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-40',
              isSelected
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
            )}
          >
            {formatTime(slot)}
          </button>
        );
      })}
    </div>
  );
}
