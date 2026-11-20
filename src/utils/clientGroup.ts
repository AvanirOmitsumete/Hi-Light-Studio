import type { Registration } from '../types';
import { isWalkIn } from './clientInfo';

/** Client group filter values: everyone, school clients, walk-ins, or one school's id. */
export const ALL_CLIENTS = 'all';
export const SCHOOL_CLIENTS = 'schools';
export const WALKIN_CLIENTS = '__walkin';

/** True when the order belongs to the chosen client group. */
export function matchesClientGroup(reg: Registration, group: string): boolean {
  if (group === ALL_CLIENTS || !group) return true;
  if (group === WALKIN_CLIENTS) return isWalkIn(reg);
  if (group === SCHOOL_CLIENTS) return !isWalkIn(reg);
  return !isWalkIn(reg) && reg.organization === group;
}
