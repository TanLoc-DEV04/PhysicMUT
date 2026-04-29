/**
 * utils/format.ts
 *
 * Pure formatting helper functions — no side effects, no business logic.
 * These are safe to import from anywhere in the app.
 */

// ─── Currency ────────────────────────────────────────────────────────────────

/**
 * Format a number as Vietnamese Dong currency.
 * @example formatCurrency(1500000) → "1.500.000 ₫"
 */
export function formatCurrency(amount: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Date / Time ─────────────────────────────────────────────────────────────

/**
 * Format an ISO date string or Date object to a localized date string.
 * @example formatDate('2024-04-17T00:00:00Z') → "17/04/2024"
 */
export function formatDate(
  value: string | Date | null | undefined,
  locale = 'vi-VN',
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  if (!value) return 'N/A';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format an ISO date string or Date to a localized date-time string.
 * @example formatDateTime('2024-04-17T14:30:00Z') → "17/04/2024, 21:30"
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  locale = 'vi-VN',
): string {
  return formatDate(value, locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Return a human-readable relative time string.
 * @example formatRelativeTime(new Date(Date.now() - 3600_000)) → "1 giờ trước"
 */
export function formatRelativeTime(value: string | Date, locale = 'vi-VN'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) return rtf.format(-diffSeconds, 'second');
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(-diffMinutes, 'minute');
  const diffHours = Math.floor(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(-diffHours, 'hour');
  const diffDays = Math.floor(diffHours / 24);
  return rtf.format(-diffDays, 'day');
}

// ─── Number ──────────────────────────────────────────────────────────────────

/**
 * Format a number with locale-aware thousand separators.
 * @example formatNumber(1234567) → "1.234.567"
 */
export function formatNumber(value: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a number as a percentage.
 * @example formatPercent(0.845) → "84,5%"
 */
export function formatPercent(value: number, locale = 'vi-VN', digits = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

// ─── String ──────────────────────────────────────────────────────────────────

/**
 * Truncate a string to a maximum length with an ellipsis.
 * @example truncate('Hello World', 7) → "Hello W…"
 */
export function truncate(text: string, maxLength: number, ellipsis = '…'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + ellipsis;
}

/**
 * Convert a string to Title Case.
 * @example toTitleCase('hello world') → "Hello World"
 */
export function toTitleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}
