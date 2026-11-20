import React from 'react';
import type { RefundRecord } from '../../types';
import { STUDIO_INFO } from '../../constants/studio';
import { formatJobOrderNo } from '../../utils/formatters';
import { methodLabel, peso, profileLine, receiptDate, refundAcknowledgment, refundFigures, type RefundSlipData } from './receiptData';

/**
 * Refund slip: the same 8.5 × 3.67 in strip as the payment receipt, cut lengthwise.
 * Customer copy (left) is signed by whoever gave the money back; studio copy (right) is
 * signed by the client as proof the money was received. Literal hex colors: this is paper.
 */
export const RefundSlipSheet: React.FC<{ data: RefundSlipData; refund: RefundRecord; signature?: string | null }> = ({ data, refund, signature }) => (
  <div className="theme-paper relative flex w-[8.5in] h-[3.667in] bg-white text-[#0a0a0a] font-sans">
    <RefundSlip data={data} refund={refund} copy="customer" />
    <div aria-hidden className="absolute top-0 bottom-0 left-[4.25in] border-l border-dashed border-[#9a9a9a]">
      <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap bg-white px-2 font-mono text-[7px] uppercase tracking-[0.3em] text-[#8a8a8a]">
        ✂ cut here
      </span>
    </div>
    <RefundSlip data={data} refund={refund} copy="studio" signature={signature} />
  </div>
);

const RefundSlip: React.FC<{ data: RefundSlipData; refund: RefundRecord; copy: 'customer' | 'studio'; signature?: string | null }> = ({
  data, refund, copy, signature,
}) => {
  const reg = data.registration;
  const isCustomer = copy === 'customer';
  const figures = refundFigures(data, refund);

  return (
    <section
      aria-label={isCustomer ? 'Customer refund slip' : 'Studio refund slip copy'}
      className="relative flex h-[3.667in] w-[4.25in] flex-col overflow-hidden px-[0.26in] pt-[0.2in] pb-[0.16in] text-[10px] leading-tight"
    >
      <header className="flex items-end justify-between gap-2 border-b-2 border-[#0a0a0a] pb-[3px]">
        <div className="min-w-0">
          <div className="text-[15px] font-black uppercase tracking-[0.06em] leading-none">{STUDIO_INFO.name}</div>
          <div className="mt-[2px] truncate text-[7px] text-[#444]">{STUDIO_INFO.shortAddress} · Tel. {STUDIO_INFO.phone}</div>
        </div>
        <div className="shrink-0 border border-[#0a0a0a] px-[5px] py-[1px] text-center font-mono text-[6.5px] font-bold uppercase leading-[1.2] tracking-[0.12em]">
          Refund Slip<br />{isCustomer ? 'Customer Copy' : 'Studio Copy'}
        </div>
      </header>

      <div className="mt-[5px] flex items-end justify-between gap-2">
        <div>
          <div className="font-mono text-[6.5px] font-bold uppercase tracking-wider text-[#666]">Refund №</div>
          <div className="font-mono text-[16px] font-black leading-none text-[#c8102e]">{refund.refund_no}</div>
        </div>
        <div className="text-right font-mono text-[8.5px] font-bold">{receiptDate(refund.created, true)}</div>
      </div>

      <div className="mt-[5px] border border-[#0a0a0a] px-[6px] py-[3px]">
        <div className="font-mono text-[8px] font-bold">
          JOB ORDER <span className="text-[#c8102e]">{formatJobOrderNo(reg.job_order_no)}</span>
        </div>
        <div className="mt-[1px] truncate text-[12px] font-black uppercase">
          {reg.family_name}, {reg.given_name}{reg.middle_name ? ` ${reg.middle_name[0]}.` : ''}
        </div>
        <div className="truncate text-[7.5px] text-[#444]">{profileLine(reg)}</div>
      </div>

      <div className="mt-[5px] space-y-[3px] font-mono">
        <Row label="Reason" value={refund.reason} />
        <Row label="Receipts" value={figures.receipts.join(', ') || '—'} />
        <Row label="Held Before Refund" value={peso(figures.heldBefore)} />
      </div>

      <div className="mt-[4px] flex items-baseline justify-between border-y-2 border-[#0a0a0a] py-[3px] font-mono">
        <span className="text-[8.5px] font-black uppercase tracking-wider">Amount Refunded · {methodLabel(refund.method)}</span>
        <span className="text-[18px] font-black">{peso(refund.amount)}</span>
      </div>

      <div className="mt-[4px] font-mono">
        <Row label="Still Held by Studio" value={peso(figures.heldAfter)} strong />
      </div>

      {isCustomer ? (
        <p className="mt-[5px] text-[7.5px] leading-snug text-[#333]">
          The money above was given back to you. Your official receipts stay on file; this slip shows the amount returned.
        </p>
      ) : (
        <p className="mt-[5px] border border-[#0a0a0a] px-[5px] py-[3px] text-[7.5px] font-bold leading-snug">
          {refundAcknowledgment(data, refund)}
        </p>
      )}

      <div className={`mt-auto grid gap-3 ${isCustomer ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <Sign label="Released By (Studio)">
          <span className="font-mono text-[9px] font-bold uppercase">{refund.refunded_by || ''}</span>
        </Sign>
        {!isCustomer && (
          <Sign label={signature && refund.signed_at ? `Client · Signed on screen ${receiptDate(refund.signed_at)}` : 'Received By · Client Signature / Date'}>
            {signature && <img src={signature} alt="Client signature" className="max-h-[26px] max-w-full object-contain" />}
          </Sign>
        )}
      </div>
      <div className="mt-[3px] text-center font-mono text-[6.5px] font-bold text-[#333]">
        {isCustomer ? 'Keep this slip with your receipts.' : `Client signs. File with job order ${formatJobOrderNo(reg.job_order_no)}.`}
      </div>
    </section>
  );
};

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="shrink-0 text-[7.5px] font-bold uppercase tracking-wider text-[#555]">{label}</span>
    <span className={`min-w-0 truncate text-right ${strong ? 'text-[12px] font-black' : 'text-[9.5px] font-bold'}`}>{value}</span>
  </div>
);

const Sign: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="text-center">
    <div className="flex h-[26px] items-end justify-center">{children}</div>
    <div className="border-t border-[#0a0a0a] pt-[1px] font-mono text-[6.5px] font-bold uppercase tracking-wider text-[#444]">{label}</div>
  </div>
);
