import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';

/**
 * Six-box OTP entry. Handles auto-focus/advance, backspace navigation,
 * and pasting a full code across boxes. Value is always a string of
 * exactly `length` digits (padded with '' internally as separate cells).
 */
export default function OtpInput({ length = 6, value, onChange, onComplete, error, disabled }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Autofocus the first empty box (or the first box) on mount.
    const firstEmpty = digits.findIndex((d) => !d);
    const target = firstEmpty === -1 ? 0 : firstEmpty;
    inputsRef.current[target]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigitAt = useCallback(
    (index, digit) => {
      const next = digits.slice();
      next[index] = digit;
      const nextValue = next.join('');
      onChange(nextValue);
      if (nextValue.length === length && !next.includes('')) {
        onComplete?.(nextValue);
      }
    },
    [digits, length, onChange, onComplete]
  );

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDigitAt(index, '');
      return;
    }
    // If the user typed/autofilled multiple characters in one box, spread them.
    if (raw.length > 1) {
      const next = digits.slice();
      let cursor = index;
      for (const char of raw.split('')) {
        if (cursor >= length) break;
        next[cursor] = char;
        cursor += 1;
      }
      const nextValue = next.join('');
      onChange(nextValue);
      const focusIndex = Math.min(cursor, length - 1);
      inputsRef.current[focusIndex]?.focus();
      if (nextValue.length === length && !next.includes('')) {
        onComplete?.(nextValue);
      }
      return;
    }

    setDigitAt(index, raw);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = pasted.split('');
    while (next.length < length) next.push('');
    const nextValue = next.join('');
    onChange(nextValue);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
    if (pasted.length === length) {
      onComplete?.(pasted);
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="One-time password">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={Boolean(error)}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'h-12 w-10 rounded-lg border border-gray-300 bg-white text-center text-xl font-semibold text-gray-900',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
              'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'sm:h-14 sm:w-12',
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30'
            )}
          />
        ))}
      </div>
      {error && <p className="mt-3 text-center text-sm text-danger-600">{error}</p>}
    </div>
  );
}
