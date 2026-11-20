import type { Registration } from '../types';
import { STUDIO_INFO } from '../constants/studio';

/** Used when the studio has not saved its own message (same text as the migration's default). */
export const DEFAULT_PICKUP_MESSAGE = 'Hi {name}! Your {studio} order JO {jo} is ready for pickup. '
  + 'Please bring your claim stub.{balance} {hours}. Call {phone}.';

/** Placeholders an admin can use in the pickup message. */
export const PICKUP_PLACEHOLDERS: ReadonlyArray<[token: string, meaning: string]> = [
  ['{name}', 'Client\'s given name'],
  ['{fullname}', 'Full name'],
  ['{jo}', 'Job order number'],
  ['{balance}', 'Unpaid balance sentence (blank when fully paid)'],
  ['{studio}', 'Studio name'],
  ['{hours}', 'Studio hours'],
  ['{phone}', 'Studio phone'],
];

const titleCase = (text: string) => text.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (letter) => letter.toUpperCase());

/** The pickup text message for one order. */
export function buildPickupMessage(reg: Registration, template = DEFAULT_PICKUP_MESSAGE): string {
  const given = titleCase((reg.given_name || '').trim().split(/\s+/)[0] || 'there');
  const fullName = titleCase([reg.given_name, reg.family_name].filter(Boolean).join(' ').trim());
  const balance = (reg.balance || 0) > 0
    ? ` Balance due: PHP ${reg.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
    : '';
  const values: Record<string, string> = {
    '{name}': given,
    '{fullname}': fullName,
    '{jo}': reg.job_order_no || '',
    '{balance}': balance,
    '{studio}': STUDIO_INFO.name,
    '{hours}': plainSmsText(STUDIO_INFO.hours),
    '{phone}': STUDIO_INFO.phone,
  };
  return plainSmsText(template)
    .replace(/\{(?:name|fullname|jo|balance|studio|hours|phone)\}/g, (token) => values[token] ?? token)
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\.{2,}/g, '.')
    .trim();
}

/** Swaps characters that would force a Unicode text (70 characters per SMS) for plain ones. */
export function plainSmsText(text: string): string {
  return text
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/₱\s?/g, 'PHP ')
    .replace(/…/g, '...');
}

/** Texts a message uses: 160 plain characters (153 each when split), or 70 (67) with other characters. */
export function smsCount(text: string): { texts: number; unicode: boolean } {
  const unicode = !/^[\x20-\x7E\r\n]*$/.test(text);
  const single = unicode ? 70 : 160;
  const part = unicode ? 67 : 153;
  return { texts: text.length <= single ? 1 : Math.ceil(text.length / part), unicode };
}

/** A Philippine mobile number in 09XXXXXXXXX form, or '' when it does not look like one. */
export function normalizeMobile(raw?: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^639\d{9}$/.test(digits)) return '0' + digits.slice(2);
  if (/^9\d{9}$/.test(digits)) return '0' + digits;
  return '';
}

const shortTime = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
});

/** "Nov 20, 3:15 PM" in studio time, or '' for an empty/invalid timestamp. */
export function studioTime(value?: string): string {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isFinite(date.getTime()) ? shortTime.format(date) : '';
}

/** Whole days since a timestamp (0 for today or invalid). */
export function daysSince(value?: string): number {
  const time = value ? new Date(value.replace(' ', 'T')).getTime() : NaN;
  return Number.isFinite(time) ? Math.max(0, Math.floor((Date.now() - time) / 86_400_000)) : 0;
}

/** Opens the device's messaging app with the number and text filled in. */
export function smsLink(mobile: string, message: string): string {
  return `sms:${mobile}?body=${encodeURIComponent(message)}`;
}
