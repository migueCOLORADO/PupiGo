import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Envio de posicion al backend como maximo cada SEND_MS mientras el recorrido esta "En curso".
// Un heartbeat reenvia la ultima lectura si el GPS no emite (bus detenido) para cumplir el NFR de 15 s.
export const SEND_MS = 5000;

// permission: 'unknown' | 'granted' | 'denied' | 'unavailable' | 'error'
export function useDriverGps({ trip }) {
  const [permission, setPermission] = useState('unknown');
  const [position, setPosition] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [sendError, setSendError] = useState(null);
  const tripRef = useRef(trip); tripRef.current = trip;
  const lastSentRef = useRef(0);
  const sharing = trip?.status === 'in_progress';

  const send = useCallback((pos) => {
    const t = tripRef.current;
    if (!t || t.status !== 'in_progress') return;
    lastSentRef.current = Date.now();
    api.sendPosition(t.id, pos)
      .then(() => { setLastSentAt(Date.now()); setSendError(null); })
      .catch((e) => setSendError(e.message));
  }, []);

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) { setPermission('unavailable'); return; }
    navigator.geolocation.getCurrentPosition(
      () => setPermission('granted'),
      (err) => setPermission(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Detecta permiso ya concedido/rechazado sin volver a preguntar.
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    navigator.permissions.query({ name: 'geolocation' }).then((s) => {
      const apply = () => {
        if (s.state === 'granted') setPermission('granted');
        else if (s.state === 'denied') setPermission('denied');
        else setPermission('unknown');
      };
      apply();
      s.onchange = apply;
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude, timestamp: new Date(p.timestamp).toISOString() };
        setPosition(pos);
        if (Date.now() - lastSentRef.current >= SEND_MS) send(pos);
      },
      (err) => { if (err.code === 1) setPermission('denied'); },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [permission, send]);

  useEffect(() => {
    if (!sharing || permission !== 'granted') return;
    const id = setInterval(() => {
      if (position && Date.now() - lastSentRef.current >= SEND_MS) {
        send({ ...position, timestamp: new Date().toISOString() });
      }
    }, SEND_MS);
    return () => clearInterval(id);
  }, [sharing, permission, position, send]);

  return { permission, position, lastSentAt, sendError, request, sharing };
}
