import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Decision: polling HTTP cada 5 s (< NFR de 15 s). Sin Django Channels ni WebSockets:
// un solo colectivo y una ruta fija no justifican la infraestructura adicional.
export const POLL_MS = 5000;

export function useActiveTrip(pollMs = POLL_MS) {
  const [trip, setTrip] = useState(undefined); // undefined = cargando, null = sin recorrido activo
  const [lastEnded, setLastEnded] = useState(null); // ultimo recorrido que dejo de estar activo (UH8: informar)
  const [error, setError] = useState(null);
  const prevRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const t = await api.activeTrip();
      const prev = prevRef.current;
      if (prev && !t) api.trip(prev.id).then(setLastEnded).catch(() => {});
      if (t) setLastEnded(null);
      prevRef.current = t;
      setTrip(t);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    const onVis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [refresh, pollMs]);

  return { trip, lastEnded, error, refresh, loading: trip === undefined };
}
