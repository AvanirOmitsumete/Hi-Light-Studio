import type { Registration } from '../../../types';
import { daysSince, studioTime } from '../../../utils/pickupMessage';

/** When an order became ready, and whether (and when) the client was told. */
export function PickupNoticeInfo({ reg }: Readonly<{ reg: Registration }>) {
  const days = daysSince(reg.ready_at);
  return (
    <div className="space-y-0.5 text-[11px]">
      <div className="font-bold text-ink">
        Ready {studioTime(reg.ready_at) || '—'}
        {days > 0 && <span className="text-neutral-500 font-normal"> · {days} day{days === 1 ? '' : 's'} ago</span>}
      </div>
      {reg.pickup_notified_at ? (
        <div className="text-emerald-700 font-bold">
          ✓ Notified {studioTime(reg.pickup_notified_at)}
          {(reg.pickup_notify_count ?? 0) > 1 && ` (${reg.pickup_notify_count}×)`}
          {reg.pickup_notified_by && <span className="text-neutral-500 font-normal"> by {reg.pickup_notified_by}</span>}
        </div>
      ) : (
        <div className="text-amber-700 font-black uppercase text-[10px]">Not notified yet</div>
      )}
    </div>
  );
}
