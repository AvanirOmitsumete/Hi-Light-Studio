import React from 'react';
import type { Registration } from '../types';

interface RegistrationStatusBadgeProps {
  status: Registration['status'];
}

export const RegistrationStatusBadge: React.FC<RegistrationStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending_payment':
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-gold-wash text-gold-soft border border-gold">
          Pending Payment
        </span>
      );
    case 'paid':
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-obsidian text-gold border border-line">
          In Photo Queue
        </span>
      );
    case 'shooting':
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-gold text-on-gold animate-pulse">
          Now Shooting
        </span>
      );
    case 'done_shooting':
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700">
          Done Shooting
        </span>
      );
    case 'ready_for_pickup':
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-700">
          Ready for Pickup
        </span>
      );
    case 'released':
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white border border-emerald-800">
          ✓ Released
        </span>
      );
    default:
      return (
        <span className="inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-300">
          {status.replace('_', ' ')}
        </span>
      );
  }
};
