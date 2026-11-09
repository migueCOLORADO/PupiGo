import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Envio de posicion al backend como maximo cada SEND_MS mientras el recorrido esta "En curso".
// Un heartbeat reenvia la ultima lectura si el GPS no emite (bus detenido) para cumplir el NFR de 15 s.
export const SEND_MS = 5000;

const hasGeo = () => typeof navigator !== 'undefined' && 'geolocation' in navigator;
// Solo es false cuando el navegador lo afirma (http fuera de localhost); si no existe la propiedad se asume seguro.
const isSecure = () => typeof window === 'undefined' || window.isSecureContext !== false;

function initialPermission() {
  if (!isSecure()) return 'insecure';
  if (!hasGeo()) return 'unavailable';
  return 'unknown';
}

async function queryPermissionState() {
  try {
    if (!navigator.permissions?.query) return null;
    const s = await navigator.permissions.query({ name: 'geolocation' });
    return s?.state || null;
  } catch {
    return null;
  }
}

// permission: 'unknown' | 'granted' | 'denied' | 'unavailable' | 'insecure' | 'error'
export function useDriverGps({ trip }) {
  const [permission, setPermission] = useState(initialPermission);
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

  // UH19 #241: se llama al iniciar el recorrido para que el navegador muestre la solicitud de permiso.
  // Devuelve el estado final para que el llamador no inicie el recorrido sin permiso (UH5).
  const request = useCallback(async () => {
    const pre = initialPermission();
    if (pre !== 'unknown') { setPermission(pre); return pre; }
    if ((await queryPermissionState()) === 'denied') { setPermission('denied'); return 'denied'; }
    const result = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, timestamp: new Date(p.timestamp).toISOString() });
          resolve('granted');
        },
        (err) => resolve(err?.code === 1 ? 'denied' : 'error'),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
    setPermission(result);
    return result;
  }, []);

  // Detecta permiso ya concedido/rechazado sin volver a preguntar.
  useEffect(() => {
    if (initialPermission() !== 'unknown' || !navigator.permissions?.query) return;
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

  return { permission, position, lastSentAt, sendError, request, sharing, secureContext: isSecure(), hasGeolocation: hasGeo() };
}
