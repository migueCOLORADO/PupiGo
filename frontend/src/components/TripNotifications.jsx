
import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { distanceMeters, routeProgress } from '../lib/geo';

const STORAGE_KEY = 'pupigo-notifications-enabled';
const POLL_MS = 5000;
const STOP_STORAGE_KEY = 'pupigo-selected-stop';
const ETA_THRESHOLD_MINUTES = 2;
const ASSUMED_SPEED_KMH = 20;

export default function TripNotifications({ trip }) {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const [selectedStopId, setSelectedStopId] = useState(
  () => localStorage.getItem(STOP_STORAGE_KEY) || ''
);


const [stops, setStops] = useState([]);
const [loadingStops, setLoadingStops] = useState(true);
const [stopsError, setStopsError] = useState('');

useEffect(() => {
  let active = true;

  api.stops()
    .then((data) => {
      if (!active) return;

      setStops(Array.isArray(data) ? data : []);
      setStopsError('');
    })
    .catch(() => {
      if (active) {
        setStopsError('No se pudieron cargar las paradas.');
      }
    })
    .finally(() => {
      if (active) setLoadingStops(false);
    });

  return () => {
    active = false;
  };
}, []);


function changeStop(value) {
  setSelectedStopId(value);
  localStorage.setItem(STOP_STORAGE_KEY, value);
}

  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [permission, setPermission] = useState(
    () => ('Notification' in window
      ? window.Notification.permission
      : 'unsupported')
  );

  const cursor = useRef(null);

  // Al abrir la pagina, registramos el ultimo evento existente.
  // Asi no mostramos notificaciones antiguas.
  useEffect(() => {
    let cancelled = false;

    api.tripEvents(0)
      .then(events => {
        if (cancelled) return;

        cursor.current = events.reduce(
          (max, event) => Math.max(max, event.id),
          0
        );
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo conectar con las notificaciones.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleNotifications() {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, 'false');
      setMessages([]);
      return;
    }

    // Solicitar permiso para notificaciones del navegador.
    if (
      'Notification' in window &&
      window.Notification.permission === 'default'
    ) {
      try {
        const result = await window.Notification.requestPermission();
        setPermission(result);
      } catch {
        setPermission('denied');
      }
    }

    try {
      // Ignorar los eventos anteriores a la activacion.
      const events = await api.tripEvents(0);

      cursor.current = events.reduce(
        (max, event) => Math.max(max, event.id),
        0
      );

      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      setError('');
    } catch {
      setError('No se pudieron activar las notificaciones.');
    }
  }

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let inFlight = false;

    async function checkEvents() {
      if (inFlight || cursor.current === null) return;
      inFlight = true;

      try {
        const events = await api.tripEvents(cursor.current);
        if (stopped) return;

        for (const event of events) {
          let title = null;

          if (event.event_type === 'started') {
            title = 'El colectivo ha iniciado su recorrido.';
          }

          if (event.event_type === 'cancelled') {
            title = 'El recorrido del colectivo fue cancelado.';
          }

          if (!title) continue;

          // Mostrar el aviso dentro de PupiGo.
          setMessages(previous => [
            { id: event.id, title },
            ...previous
          ].slice(0, 3));

          // Mostrar notificacion del navegador si hay permiso.
          if (
            'Notification' in window &&
            window.Notification.permission === 'granted'
          ) {
            try {
              new window.Notification('PupiGo', {
                body: title,
                tag: `pupigo-event-${event.id}`
              });
            } catch {
              // El aviso interno sigue disponible.
            }
          }
        }

        cursor.current = events.reduce(
          (max, event) => Math.max(max, event.id),
          cursor.current
        );

        setError('');
      } catch {
        if (!stopped) {
          setError('No se pudieron actualizar los avisos.');
        }
      } finally {
        inFlight = false;
      }
    }

    checkEvents();
    const interval = setInterval(checkEvents, POLL_MS);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [enabled]);


useEffect(() => {
  if (
    !enabled ||
    !selectedStopId ||
    trip?.status !== 'in_progress' ||
    !trip.last_position ||
    trip.connection_lost
  ) {
    return;
  }

  const stop = trip.route?.stops?.find(
    (s) => String(s.id) === selectedStopId
  );

  if (!stop) return;

  // No notificar usando una posición GPS antigua.
  if (
    trip.position_age_seconds == null ||
    trip.position_age_seconds > trip.gps_max_interval_seconds
  ) {
    return;
  }

  const receivedAt = Date.parse(trip.last_position.received_at);

  if (
    !Number.isFinite(receivedAt) ||
    Date.now() - receivedAt > trip.gps_max_interval_seconds * 1000
  ) {
    return;
  }

  // Comprobar que la parada no haya quedado atrás.
  const currentProgress = routeProgress(
    trip.last_position, trip.route
  );
  const stopProgress = routeProgress(stop, trip.route);

  if (trip.direction === 'ida' &&
      currentProgress > stopProgress + 0.03) return;

  if (trip.direction === 'vuelta' &&
      currentProgress < stopProgress - 0.03) return;

  // Estimación preliminar del tiempo a la parada.
  const distance = distanceMeters(trip.last_position, stop);
  const eta = distance / (ASSUMED_SPEED_KMH * 1000 / 60);

  if (!Number.isFinite(eta) || eta >= ETA_THRESHOLD_MINUTES) {
    return;
  }

  // Evitar avisos duplicados por recorrido y parada.
  const alertKey = `pupigo-near-${trip.id}-${stop.id}`;

  if (localStorage.getItem(alertKey) === 'true') return;

  localStorage.setItem(alertKey, 'true');

  const title = `El colectivo está próximo a ${stop.name}.`;

  // Aviso dentro de PupiGo.
  setMessages((previous) => [
    { id: alertKey, title },
    ...previous
  ].slice(0, 3));

  // Notificación del navegador.
  if (
    'Notification' in window &&
    window.Notification.permission === 'granted'
  ) {
    try {
      new window.Notification('PupiGo', {
        body: title,
        tag: alertKey
      });
    } catch {
      // El aviso interno permanece disponible.
    }
  }
}, [trip, enabled, selectedStopId]);


  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-sm">
            Notificaciones
          </div>
          <div className="text-xs text-gray-500">
            Avisos del colectivo en tiempo real
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={toggleNotifications}
        >
          {enabled ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      <div className="text-xs text-gray-500">
        {enabled
          ? 'Notificaciones activadas'
          : 'Notificaciones desactivadas'}
      </div>

{enabled && (
  <div className="flex flex-col gap-2">
    <label
      htmlFor="pupigo-stop"
      className="text-xs font-semibold text-gray-600"
    >
      Mi parada
    </label>

    <select
      id="pupigo-stop"
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
      value={selectedStopId}
      onChange={(e) => changeStop(e.target.value)}
      disabled={stops.length === 0}
    >
      <option value="">Selecciona tu parada</option>

      {stops.map((stop) => (
        <option key={stop.id} value={String(stop.id)}>
          {stop.name}
        </option>
      ))}
    </select>


    {(loadingStops || stopsError || stops.length === 0) && (
    <p className="text-xs text-gray-500">
        {loadingStops
        ? 'Cargando paradas...'
        : stopsError || 'No hay paradas configuradas.'}
    </p>
        )}
    </div>
    )}

      {enabled && permission !== 'granted' && (
        <p className="text-xs text-gray-500">
          Los avisos se mostraran dentro de PupiGo.
          Para recibir alertas del navegador debes conceder
          el permiso de notificaciones.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {messages.map(message => (
        <div
          key={message.id}
          role="status"
          className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900"
        >
          {message.title}
        </div>
      ))}
    </div>
  );
}
