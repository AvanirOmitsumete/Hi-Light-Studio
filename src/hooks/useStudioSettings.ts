import { useCallback, useEffect, useState } from 'react';
import { pb } from '../db/pocketbase';
import type { SessionType, StudioSettings } from '../types';
import { REGISTRATION_TERMS_CLAUSES } from '../constants/studio';
import { DEFAULT_PICKUP_MESSAGE } from '../utils/pickupMessage';

/**
 * Studio switches (school / walk-in registrations), walk-in terms and session types.
 * Public data, so the kiosk can read it; updates live when the admin changes it.
 */
export function useStudioSettings() {
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [main, sessions] = await Promise.all([
        pb.collection('studio_settings').getFirstListItem<StudioSettings>("key = 'main'", { requestKey: null, cache: 'no-store' }),
        pb.collection('session_types').getFullList<SessionType>({ sort: 'order,name', requestKey: null, cache: 'no-store' }),
      ]);
      setSettings(main);
      setSessionTypes(sessions);
    } catch (err) {
      console.error('Failed to load studio settings:', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const stops: Array<() => Promise<void>> = [];
    void refresh();
    for (const name of ['studio_settings', 'session_types']) {
      void pb.collection(name).subscribe('*', () => { if (active) void refresh(); })
        .then((stop) => { if (active) stops.push(stop); else void stop(); })
        .catch(() => { /* realtime is optional; the data was loaded above */ });
    }
    return () => {
      active = false;
      stops.forEach((stop) => void stop().catch(() => {}));
    };
  }, [refresh]);

  return {
    settings,
    loaded,
    /** Older databases without the settings record behave like before: school only. */
    schoolEnabled: settings ? settings.school_enabled : true,
    walkinEnabled: settings ? settings.walkin_enabled : false,
    walkinTerms: settings?.walkin_terms?.length ? settings.walkin_terms : [...REGISTRATION_TERMS_CLAUSES],
    pickupMessage: settings?.pickup_message?.trim() || DEFAULT_PICKUP_MESSAGE,
    sessionTypes,
    activeSessionTypes: sessionTypes.filter((type) => type.is_active),
    refresh,
  };
}
