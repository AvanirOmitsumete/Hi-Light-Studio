// The studio day runs midnight to midnight in Asia/Manila (UTC+8, no daylight saving).
const MANILA_OFFSET_MS = 8 * 3600_000;

/**
 * Start of the current studio day as a PocketBase datetime string in UTC
 * (e.g. "2026-11-18 16:00:00.000Z"), for filters like `created >= {:start}`.
 */
export function studioDayStartUtc(now = Date.now()): string {
  const manilaDay = new Date(now + MANILA_OFFSET_MS).toISOString().slice(0, 10);
  return new Date(Date.parse(`${manilaDay}T00:00:00Z`) - MANILA_OFFSET_MS).toISOString().replace('T', ' ');
}

/** Start of the current month (the 1st, Manila midnight) as a PocketBase datetime string in UTC. */
export function studioMonthStartUtc(now = Date.now()): string {
  const manilaMonth = new Date(now + MANILA_OFFSET_MS).toISOString().slice(0, 7);
  return new Date(Date.parse(`${manilaMonth}-01T00:00:00Z`) - MANILA_OFFSET_MS).toISOString().replace('T', ' ');
}
