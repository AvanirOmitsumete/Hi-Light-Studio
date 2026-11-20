import type { Organization, Package, PaymentRecord, RefundRecord, Registration } from '../../types';
import { isWalkIn } from '../../utils/clientInfo';

/**
 * One set of money rules for the admin overview cards, the school / package lists, the
 * Audit Export and the CSV, so they always agree. Amounts are added in centavos and returned in pesos.
 *
 * - A payment counts unless it is voided (or "refunded" on old records). Refunds are separate
 *   records dated when the money was given back; they never change the original payment.
 * - Collections = counted payments received in the period; Refunds = refunds given in the period;
 *   Net collections = Collections − Refunds.
 * - Gross invoiced = totals of job orders made in the period; a cancelled order counts only for the
 *   money it still holds (received − refunded), because the rest is no longer owed.
 * - Outstanding = what is still unpaid on the active (not cancelled) job orders made in the period.
 * - Checks: Gross = (Paid − Refunded on these orders) + Outstanding − Overpaid, and
 *   Collections − Refunds = (Paid − Refunded on these orders) + (Payments − Refunds for job orders made before the period).
 */

export const WALKIN_KEY = '__walkin';
export const UNKNOWN_PACKAGE = '__none';

export interface AuditOrder {
  registration: Registration;
  cancelled: boolean;
  /** The order's full price (job order total). */
  total: number;
  /** What it adds to Gross Invoiced (total, or only the money still held when cancelled). */
  billed: number;
  /** Counted payments ever received for it. */
  paid: number;
  /** Refunds ever given for it. */
  refunded: number;
  /** Paid − Refunded. */
  net: number;
  /** Still unpaid (0 for cancelled orders). */
  balance: number;
  /** Net paid beyond the total: money owed back to the client (refund due). */
  overpaid: number;
}

export interface AuditPayment {
  payment: PaymentRecord;
  registration?: Registration;
  counted: boolean;
  /** True when the job order was made before the period (only for Today / This Month). */
  earlierOrder: boolean;
}

export interface AuditRefund {
  refund: RefundRecord;
  registration?: Registration;
  earlierOrder: boolean;
}

export interface AuditGroup {
  key: string;
  code: string;
  name: string;
  /** Active job orders made in the period. */
  count: number;
  billed: number;
  /** Payments received minus refunds given in the period, for this group's job orders. */
  collected: number;
  /** Still unpaid on this group's job orders made in the period. */
  balance: number;
}

export interface AuditData {
  since?: string;
  orders: AuditOrder[];
  payments: AuditPayment[];
  refunds: AuditRefund[];
  totals: {
    gross: number;
    paidOnOrders: number;
    refundedOnOrders: number;
    outstanding: number;
    overpaid: number;
    /** Payments received in the period (before refunds). */
    collections: number;
    /** Refunds given in the period. */
    refunds: number;
    /** Collections − Refunds. */
    netCollections: number;
    collectionsOnEarlierOrders: number;
    refundsOnEarlierOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    countedPayments: number;
    voidedPayments: number;
    refundCount: number;
  };
  /** Gross = (Paid − Refunded on these orders) + Outstanding − Overpaid. */
  ordersBalanced: boolean;
  /** Collections − Refunds = (Paid − Refunded on these orders) + (Payments − Refunds on earlier orders). */
  paymentsBalanced: boolean;
  bySchool: AuditGroup[];
  byPackage: AuditGroup[];
}

const cents = (amount: number | undefined) => Math.round((amount || 0) * 100);
const pesos = (value: number) => value / 100;
const createdTime = (value: string) => Date.parse(value.replace(' ', 'T'));
const inPeriod = (created: string, since?: string) => !since || created >= since;
/** A payment counts unless it was voided (or marked refunded under the old method). */
export const isCountedPayment = (payment: PaymentRecord) => payment.status !== 'voided' && payment.status !== 'refunded';

export function buildAudit(
  registrations: Registration[],
  payments: PaymentRecord[],
  refunds: RefundRecord[] = [],
  since?: string,
  catalog: { organizations?: Organization[]; packages?: Package[] } = {},
): AuditData {
  const regById = new Map(registrations.map((reg) => [reg.id, reg]));
  const paidById = new Map<string, number>();
  for (const payment of payments) {
    if (isCountedPayment(payment)) paidById.set(payment.registration, (paidById.get(payment.registration) ?? 0) + cents(payment.amount));
  }
  const refundedById = new Map<string, number>();
  for (const refund of refunds) refundedById.set(refund.registration, (refundedById.get(refund.registration) ?? 0) + cents(refund.amount));

  // Job orders made in the period.
  const orderRows = registrations
    .filter((reg) => inPeriod(reg.created, since))
    .sort((a, b) => (a.job_order_no || '').localeCompare(b.job_order_no || '') || createdTime(a.created) - createdTime(b.created))
    .map((registration) => {
      const cancelled = registration.status === 'cancelled';
      const total = cents(registration.total_amount);
      const paid = paidById.get(registration.id) ?? 0;
      const refunded = refundedById.get(registration.id) ?? 0;
      const net = paid - refunded;
      return {
        registration, cancelled, total, paid, refunded, net,
        billed: cancelled ? Math.max(0, net) : total,
        balance: cancelled ? 0 : Math.max(0, total - net),
        overpaid: cancelled ? 0 : Math.max(0, net - total),
      };
    });
  const periodOrderIds = new Set(orderRows.map(({ registration }) => registration.id));

  // Payments received and refunds given in the period (voided payments listed but not counted).
  const paymentRows = payments
    .filter((payment) => inPeriod(payment.created, since))
    .sort((a, b) => createdTime(a.created) - createdTime(b.created) || a.id.localeCompare(b.id))
    .map((payment) => ({
      payment,
      registration: regById.get(payment.registration),
      counted: isCountedPayment(payment),
      earlierOrder: Boolean(since) && !periodOrderIds.has(payment.registration),
    }));
  const refundRows = refunds
    .filter((refund) => inPeriod(refund.created, since))
    .sort((a, b) => createdTime(a.created) - createdTime(b.created) || a.id.localeCompare(b.id))
    .map((refund) => ({
      refund,
      registration: regById.get(refund.registration),
      earlierOrder: Boolean(since) && !periodOrderIds.has(refund.registration),
    }));

  const sum = <T,>(rows: T[], value: (row: T) => number) => rows.reduce((total, row) => total + value(row), 0);
  const gross = sum(orderRows, (row) => row.billed);
  const paidOnOrders = sum(orderRows, (row) => row.paid);
  const refundedOnOrders = sum(orderRows, (row) => row.refunded);
  const outstanding = sum(orderRows, (row) => row.balance);
  const overpaid = sum(orderRows, (row) => row.overpaid);
  // Cancelled orders that refunded more than they hold would make "billed" negative; keep the gap for the check.
  const cancelledShortfall = sum(orderRows.filter((row) => row.cancelled), (row) => Math.max(0, -row.net));
  const countedPayments = paymentRows.filter((row) => row.counted);
  const collections = sum(countedPayments, (row) => cents(row.payment.amount));
  const refundTotal = sum(refundRows, (row) => cents(row.refund.amount));
  const collectionsOnEarlierOrders = sum(countedPayments.filter((row) => row.earlierOrder), (row) => cents(row.payment.amount));
  const refundsOnEarlierOrders = sum(refundRows.filter((row) => row.earlierOrder), (row) => cents(row.refund.amount));

  // Breakdowns: schools (and walk-ins) and packages, each with a row for everything so totals match.
  const groupOf = (reg?: Registration) => (!reg || isWalkIn(reg) ? WALKIN_KEY : reg.organization || WALKIN_KEY);
  const packageOf = (reg?: Registration) => reg?.package || UNKNOWN_PACKAGE;
  const schools = new Map<string, AuditGroup>();
  for (const org of catalog.organizations ?? []) {
    schools.set(org.id, { key: org.id, code: org.code || 'ORG', name: org.name, count: 0, billed: 0, collected: 0, balance: 0 });
  }
  const packagesByKey = new Map<string, AuditGroup>();
  for (const pkg of catalog.packages ?? []) {
    packagesByKey.set(pkg.id, { key: pkg.id, code: pkg.code || 'PKG', name: pkg.name, count: 0, billed: 0, collected: 0, balance: 0 });
  }
  const schoolGroup = (reg?: Registration) => {
    const key = groupOf(reg);
    let group = schools.get(key);
    if (!group) {
      const org = reg?.expand?.organization;
      group = key === WALKIN_KEY
        ? { key, code: 'WALK-IN', name: 'Walk-in clients', count: 0, billed: 0, collected: 0, balance: 0 }
        : { key, code: org?.code || 'ORG', name: org?.name || 'Removed school', count: 0, billed: 0, collected: 0, balance: 0 };
      schools.set(key, group);
    }
    return group;
  };
  const packageGroup = (reg?: Registration) => {
    const key = packageOf(reg);
    let group = packagesByKey.get(key);
    if (!group) {
      const pkg = reg?.expand?.package;
      group = { key, code: pkg?.code || '—', name: pkg?.name || 'No package / removed package', count: 0, billed: 0, collected: 0, balance: 0 };
      packagesByKey.set(key, group);
    }
    return group;
  };
  for (const row of orderRows) {
    for (const group of [schoolGroup(row.registration), packageGroup(row.registration)]) {
      if (!row.cancelled) group.count += 1;
      group.billed += row.billed;
      group.balance += row.balance;
    }
  }
  for (const row of countedPayments) {
    schoolGroup(row.registration).collected += cents(row.payment.amount);
    packageGroup(row.registration).collected += cents(row.payment.amount);
  }
  for (const row of refundRows) {
    schoolGroup(row.registration).collected -= cents(row.refund.amount);
    packageGroup(row.registration).collected -= cents(row.refund.amount);
  }
  const toPesos = (group: AuditGroup): AuditGroup => ({
    ...group, billed: pesos(group.billed), collected: pesos(group.collected), balance: pesos(group.balance),
  });
  // Walk-ins last; groups with nothing in the period after the active ones.
  const ordered = (groups: Iterable<AuditGroup>) => [...groups]
    .sort((a, b) => Number(a.key === WALKIN_KEY) - Number(b.key === WALKIN_KEY)
      || Number(!a.count && !a.collected) - Number(!b.count && !b.collected) || a.code.localeCompare(b.code))
    .map(toPesos);

  const netOnOrders = paidOnOrders - refundedOnOrders;
  return {
    since,
    orders: orderRows.map((row) => ({
      ...row, total: pesos(row.total), billed: pesos(row.billed), paid: pesos(row.paid), refunded: pesos(row.refunded),
      net: pesos(row.net), balance: pesos(row.balance), overpaid: pesos(row.overpaid),
    })),
    payments: paymentRows,
    refunds: refundRows,
    totals: {
      gross: pesos(gross),
      paidOnOrders: pesos(paidOnOrders),
      refundedOnOrders: pesos(refundedOnOrders),
      outstanding: pesos(outstanding),
      overpaid: pesos(overpaid),
      collections: pesos(collections),
      refunds: pesos(refundTotal),
      netCollections: pesos(collections - refundTotal),
      collectionsOnEarlierOrders: pesos(collectionsOnEarlierOrders),
      refundsOnEarlierOrders: pesos(refundsOnEarlierOrders),
      activeOrders: orderRows.filter((row) => !row.cancelled).length,
      cancelledOrders: orderRows.filter((row) => row.cancelled).length,
      countedPayments: countedPayments.length,
      voidedPayments: paymentRows.length - countedPayments.length,
      refundCount: refundRows.length,
    },
    ordersBalanced: gross === netOnOrders + outstanding - overpaid + cancelledShortfall,
    paymentsBalanced: collections - refundTotal === netOnOrders + collectionsOnEarlierOrders - refundsOnEarlierOrders,
    bySchool: ordered(schools.values()),
    byPackage: ordered(packagesByKey.values()),
  };
}
