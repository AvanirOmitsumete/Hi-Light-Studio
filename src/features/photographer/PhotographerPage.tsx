import React from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { usePhotographerQueue } from './usePhotographerQueue';
import { PhotographerHeader } from './components/PhotographerHeader';
import { PhotographerQueueCard } from './components/PhotographerQueueCard';
import { PhotographerHistoryList } from './components/PhotographerHistoryList';

export const PhotographerPage: React.FC = () => {
  const {
    queue,
    recentlyDone,
    loading,
    activeTab,
    setActiveTab,
    currentlyShootingId,
    fetchLiveQueue,
    handleCallStudent,
    handleMarkDone,
  } = usePhotographerQueue();

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
      {/* Studio Floor Banner */}
      <PhotographerHeader onSync={fetchLiveQueue} />

      {/* Mode Switcher */}
      <div className="animate-enter-delay-1 grid grid-cols-2 sm:flex items-center gap-2.5 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`btn-tactile min-h-[44px] flex items-center justify-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider border-2 cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-obsidian text-gold border-line shadow-lux-gold'
              : 'bg-panel text-neutral-700 border-neutral-300 hover:border-line'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Waiting Queue</span>
          <span
            className={`font-mono px-1.5 py-0.5 text-[10px] font-black ${
              activeTab === 'queue'
                ? 'bg-gold text-on-gold'
                : 'bg-neutral-200 text-ink'
            }`}
          >
            {queue.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`btn-tactile min-h-[44px] flex items-center justify-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider border-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-obsidian text-gold border-line shadow-lux-gold'
              : 'bg-panel text-neutral-700 border-neutral-300 hover:border-line'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Today</span>
          <span
            className={`font-mono px-1.5 py-0.5 text-[10px] font-black ${
              activeTab === 'history'
                ? 'bg-gold text-on-gold'
                : 'bg-neutral-200 text-ink'
            }`}
          >
            {recentlyDone.length}
          </span>
        </button>
      </div>

      {/* QUEUE CARDS GRID */}
      {activeTab === 'queue' && (
        <div className="animate-enter-delay-1">
          {loading ? (
            <div className="bg-panel border-2 border-line p-16 text-center font-mono text-neutral-500 text-xs uppercase tracking-widest">
              Syncing live studio queue...
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-panel border-2 border-line p-12 sm:p-20 text-center shadow-lux">
              <div className="w-12 h-12 bg-obsidian text-gold flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-ink uppercase tracking-wider">
                Studio Floor Queue is Clear
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto mt-1">
                New paid clients will appear here with an audio chime as soon as the cashier
                confirms their payment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {queue.map((reg, idx) => (
                <PhotographerQueueCard
                  key={reg.id}
                  registration={reg}
                  index={idx}
                  isShooting={reg.id === currentlyShootingId || reg.status === 'shooting'}
                  onCallStudent={handleCallStudent}
                  onMarkDone={handleMarkDone}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED SHOOTS HISTORY */}
      {activeTab === 'history' && <PhotographerHistoryList recentlyDone={recentlyDone} />}
    </div>
  );
};
