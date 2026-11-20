import React from 'react';
import { Check } from 'lucide-react';
import type { Registration } from '../../../types';
import { formatJobOrderNo, formatQueueNumber } from '../../../utils/formatters';

interface RegistrationConfirmationProps {
  record: Registration;
  onReset: () => void;
}

export const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  record,
  onReset,
}) => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-enter">
      <div className="no-print bg-obsidian text-white border-2 border-line p-6 sm:p-8 shadow-lux-gold mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gold block mb-1">
              STATUS // OFFICIAL JOB ORDER RECORDED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Registration Complete
            </h2>
          </div>
          <div className="w-11 h-11 bg-gold text-on-gold flex items-center justify-center shrink-0">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 mt-4 leading-relaxed">
          Proceed to the <strong className="text-gold uppercase">Cashier Counter</strong> and
          present your Job Order or Queue Number below to pay. The cashier prints your official Job Order claim stub after payment.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-obsidian-2 border border-neutral-800 p-4">
            <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
              Job Order No.
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-red-500 mt-1 block">
              {formatJobOrderNo(record.job_order_no)}
            </span>
          </div>
          <div className="bg-obsidian-2 border border-gold p-4">
            <span className="font-mono text-[10px] font-bold text-gold uppercase tracking-widest block">
              Daily Queue No.
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-white mt-1 block">
              {formatQueueNumber(record.queue_number)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <button
            type="button"
            onClick={onReset}
            className="btn-tactile flex-1 min-h-[48px] px-6 py-3 bg-gold text-on-gold font-black text-xs uppercase tracking-widest cursor-pointer"
          >
            Register Next Client
          </button>
        </div>
      </div>
    </div>
  );
};
