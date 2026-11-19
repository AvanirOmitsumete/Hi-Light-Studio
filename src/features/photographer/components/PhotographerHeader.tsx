import React from 'react';
import { Volume2, RotateCw } from 'lucide-react';
import { playStudioChime } from '../../../utils/audio';

interface PhotographerHeaderProps {
  onSync: () => void;
}

export const PhotographerHeader: React.FC<PhotographerHeaderProps> = ({ onSync }) => {
  return (
    <div className="animate-enter bg-obsidian text-white p-5 sm:p-6 mb-6 border-2 border-line shadow-lux-gold flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-gold text-on-gold px-2 py-0.5">
            Photo Floor
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 border border-emerald-700 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-400 animate-status-pulse" />
            Live Queue
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white">
          Photographer <span className="text-gold">Session Queue</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Paid clients stream into the shooting queue automatically in First-Come, First-Served order.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <button
          type="button"
          onClick={playStudioChime}
          className="btn-tactile min-h-[44px] flex items-center gap-2 px-4 py-2 bg-obsidian-2 hover:bg-neutral-800 border border-neutral-700 text-gold text-xs font-black uppercase tracking-widest cursor-pointer"
        >
          <Volume2 className="w-4 h-4" /> Chime
        </button>
        <button
          type="button"
          onClick={onSync}
          className="btn-tactile min-h-[44px] flex items-center gap-2 px-4 py-2 bg-gold text-on-gold text-xs font-black uppercase tracking-widest cursor-pointer"
        >
          <RotateCw className="w-4 h-4" /> Sync
        </button>
      </div>
    </div>
  );
};
