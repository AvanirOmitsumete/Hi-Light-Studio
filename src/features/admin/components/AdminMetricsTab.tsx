import React from 'react';
import { DollarSign, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Organization, Registration } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface AdminMetricsTabProps {
  metrics: {
    totalRegistrations: number;
    totalPaidShooting: number;
    totalCompleted: number;
    totalCollections: number;
    totalOutstandingBalances: number;
  };
  organizations: Organization[];
  registrations: Registration[];
}

export const AdminMetricsTab: React.FC<AdminMetricsTabProps> = ({
  metrics,
  organizations,
  registrations,
}) => {
  return (
    <div className="space-y-6 animate-enter">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-obsidian text-white border-2 border-line shadow-lux-gold p-6">
          <div className="flex items-center justify-between text-gold mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              01 // Collections
            </span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="font-mono text-3xl font-black text-gold">
            {formatCurrency(metrics.totalCollections)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Verified cash &amp; digital payments</p>
        </div>

        <div className="bg-panel border-2 border-line shadow-lux p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              02 // Registered
            </span>
            <Users className="w-4 h-4 text-ink" />
          </div>
          <div className="font-mono text-3xl font-black text-ink">
            {metrics.totalRegistrations}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Participants enrolled via LAN</p>
        </div>

        <div className="bg-panel border-2 border-line shadow-lux p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              03 // Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-gold-soft" />
          </div>
          <div className="font-mono text-3xl font-black text-ink">
            {metrics.totalCompleted}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {metrics.totalPaidShooting} paid sessions processed
          </p>
        </div>

        <div className="bg-panel border-2 border-line shadow-lux p-6">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              04 // Receivables
            </span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-mono text-3xl font-black text-red-600">
            {formatCurrency(metrics.totalOutstandingBalances)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Locked until full settlement</p>
        </div>
      </div>

      <div className="bg-panel border-2 border-line shadow-lux p-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-line mb-4">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-ink">
            <span className="font-mono text-gold-soft mr-2">DIRECTORY //</span>
            Registered Client Organizations
          </h3>
          <span className="font-mono text-[10px] text-neutral-500 uppercase">
            {organizations.length} Active
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => {
            const count = registrations.filter((r) => r.organization === org.id).length;
            return (
              <div
                key={org.id}
                className="p-4 bg-canvas border border-line flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block font-mono text-[10px] font-black bg-obsidian text-gold px-2 py-0.5 uppercase">
                    {org.code || 'ORG'}
                  </span>
                  <h4 className="text-sm font-black text-ink uppercase mt-2">{org.name}</h4>
                </div>
                <div className="font-mono text-xs text-neutral-600 mt-3 pt-2 border-t border-neutral-300 flex justify-between items-center">
                  <span>Total Registrations:</span>
                  <span className="font-black text-ink text-sm">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
