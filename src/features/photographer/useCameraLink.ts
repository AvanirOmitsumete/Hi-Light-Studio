import { useCallback, useEffect, useState } from 'react';
import { useWorkflowData, workflowError } from '../../hooks/useWorkflowData';
import { useToast } from '../../context/ToastContext';
import { cameraAction, type CameraStatus } from '../camera/cameraApi';

const storageKey = 'studioflow-camera-station';
const scanInterval = 4_000;

function savedStation() {
  try { return localStorage.getItem(storageKey) || ''; } catch { return ''; }
}

/**
 * The camera this photographer device controls. While the Photo Floor is open
 * the station is scanned every few seconds, so new shots reach the linked
 * client's folder almost immediately (the server also scans once a minute).
 */
export function useCameraLink() {
  const { toast } = useToast();
  const { data: stations, refresh } = useWorkflowData<CameraStatus[]>('/camera');
  const [selectedId, setSelectedId] = useState(savedStation);
  const [live, setLive] = useState<CameraStatus | null>(null);
  const [error, setError] = useState('');

  const listed = stations?.find((station) => station.id === selectedId) ?? null;
  const camera = live?.id === selectedId ? live : listed;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setLive(null);
    setError('');
    try {
      if (id) localStorage.setItem(storageKey, id);
      else localStorage.removeItem(storageKey);
    } catch { /* per-device convenience only */ }
  }, []);

  const enabled = !!listed?.enabled;
  useEffect(() => {
    if (!selectedId || !enabled) return;
    let active = true;
    const tick = async () => {
      try {
        const status = await cameraAction(selectedId, 'scan');
        if (active) { setLive(status); setError(''); }
      } catch (err) {
        if (active) setError(workflowError(err));
      }
    };
    void tick();
    const timer = window.setInterval(tick, scanInterval);
    return () => { active = false; window.clearInterval(timer); };
  }, [selectedId, enabled]);

  const run = useCallback(async (action: 'start' | 'end' | 'claim-waiting', registration?: string) => {
    if (!selectedId) return false;
    try {
      setLive(await cameraAction(selectedId, action, registration));
      refresh();
      return true;
    } catch (err) {
      toast.error('Camera import: ' + workflowError(err));
      return false;
    }
  }, [selectedId, refresh, toast]);

  return {
    stations: stations ?? [],
    selectedId: listed ? selectedId : '',
    select,
    camera: listed ? camera : null,
    error,
    linkClient: (registrationId: string) => run('start', registrationId),
    unlinkClient: (registrationId?: string) => run('end', registrationId),
    claimWaiting: () => run('claim-waiting'),
  };
}
