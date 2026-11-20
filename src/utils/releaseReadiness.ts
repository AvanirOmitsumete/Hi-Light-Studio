import type { Registration } from '../types';

// Mirrors the production gate in pb_hooks/job_order.pb.js, which is authoritative.
const READY_STATUSES = new Set(['completed', 'ready_for_pickup']);
const READY_FRAMING = new Set(['framed', 'ready_for_pickup']);
// Statuses the server only reaches after photography (it sets shoot_completed with them).
const PHOTOGRAPHED_STATUSES = new Set(['done_shooting', 'completed', 'ready_for_pickup', 'released']);

/**
 * True once the photographer finished the shoot. `shoot_completed` is a hidden field, so the
 * API normally omits it; the order's status tells the same thing.
 */
export function isPhotographed(reg: Registration): boolean {
  return reg.shoot_completed ?? PHOTOGRAPHED_STATUSES.has(reg.status);
}

/** True once the order was photographed and an admin marked its production ready. */
export function isReadyForRelease(reg: Registration): boolean {
  return reg.status !== 'cancelled'
    && isPhotographed(reg)
    && (READY_STATUSES.has(reg.status) || READY_FRAMING.has(reg.framing_status ?? ''));
}

/** Short reason shown to the cashier when an order cannot be released yet. */
export function releaseBlocker(reg: Registration): string | null {
  if (reg.status === 'cancelled') return 'This job order is cancelled.';
  if (!isPhotographed(reg)) return 'Photography is not finished yet.';
  if (!isReadyForRelease(reg)) return 'Production is not marked ready. An admin must set it to Ready for Pickup in Admin → Production & Pickup.';
  return null;
}
