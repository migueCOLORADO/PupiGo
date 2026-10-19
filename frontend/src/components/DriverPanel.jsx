import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useDriverGps } from '../hooks/useDriverGps';
import { useNow } from '../hooks/useNow';
import { formatAgo, secondsSince } from '../lib/time';
import DirToggle from './DirToggle';
import { NAMES } from './map/geometry';
import { DirArrow } from './map/icons';
import StatusChip from './StatusChip';
import StatusHelp from './StatusHelp';
import Uh9Alert from './Uh9Alert';
import { BrandFoot } from './BrandSlogan';

function GpsCard({ gps }) {
  const now = useNow();
  const { permission, position, lastSentAt, sendError, request, sharing } = gps;
  if (permission === 'unavailable') return (
    <Uh9Alert variant="danger" title="Geolocalizacion no disponible"
      message="Este navegador no soporta geolocalizacion. Abre PupiGo en un navegador compatible (Chrome, Edge o Safari)." />
  );
  if (permission === 'denied') return (
    <Uh9Alert variant="danger" title="Permiso de ubicacion rechazado"
      message="PupiGo necesita tu ubicacion para compartir la posicion del colectivo. Activala en la configuracion del navegador y recarga la pagina."
      actionLabel="Recargar pagina" onAction={() => window.location.reload()} />
  );
  if (permission !== 'granted') return (
    <div className="card flex flex-col gap-2.5">
      <div className="text-[13px] font-bold">Ubicación GPS</div>
      <div className="text-xs text-gray-500 leading-relaxed">Para iniciar un recorrido debes permitir el acceso a tu ubicación.</div>
      <button type="button" className="btn btn-primary" onClick={request}>Permitir ubicación</button>
      {permission === 'error' && <div className="text-xs text-red-600 font-semibold">No se pudo obtener la ubicación. Intenta de nuevo.</div>}
    </div>
  );
  return (
    <div className="alert-ok">
      <div>Ubicación activa{position && <span className="font-medium opacity-80"> · {position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>}</div>
      {sharing && <div className="opacity-80 font-medium">Compartiendo · enviado {formatAgo(lastSentAt ? secondsSince(new Date(lastSentAt).toISOString(), now) : null)}</div>}
      {sendError && <div className="text-red-700">Error al enviar: {sendError}</div>}
    </div>
  );
}

export default function DriverPanel({ trip, refresh, direction, onDirectionChange, compact }) {
  const gps = useDriverGps({ trip });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async (fn) => {
    setBusy(true); setError(null);
    try { await fn(); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const status = trip?.status;
  const dir = trip?.direction || direction;
  const start = dir === 'vuelta' ? NAMES.eafit.short : NAMES.metro.short;
  const end = dir === 'vuelta' ? NAMES.metro.short : NAMES.eafit.short;
  const canStart = gps.permission === 'granted';

  return (
    <div className={`flex flex-col gap-3 w-full ${compact ? '' : 'h-full'}`}>
      {!compact && <div className="panel-title">Panel del conductor</div>}
      <GpsCard gps={gps} />

      <div className={`m-card-primary${trip ? '' : ' off'}`}>
        <div className="m-row-top">
          <div className="m-direction"><span className="stop start">{start}</span><DirArrow flipped={dir === 'vuelta'} sw={2.6} /><span className="stop end">{end}</span></div>
          <div className="flex items-center gap-2"><StatusHelp current={status} /><StatusChip compact status={status} /></div>
        </div>
        <div className="m-sub">
          {!trip && 'Elige la dirección y pon el recorrido en espera.'}
          {status === 'waiting' && `Los estudiantes tienen ~${trip.waiting_minutes} min para abordar.`}
          {status === 'in_progress' && 'Compartiendo ubicación con los estudiantes.'}
        </div>
      </div>

      {!trip && (
        <div className="flex flex-col gap-2.5">
          <DirToggle mobile direction={direction} onChange={onDirectionChange} />
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => api.createTrip(direction))}>Poner en espera</button>
        </div>
      )}
      {status === 'waiting' && (
        <div className="flex flex-col gap-2.5">
          <button type="button" className="btn btn-primary" disabled={busy || !canStart} title={canStart ? '' : 'Permite la ubicación para iniciar'}
            onClick={() => run(() => api.start(trip.id))}>Iniciar recorrido</button>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={() => run(() => api.cancel(trip.id))}>Cancelar recorrido</button>
        </div>
      )}
      {status === 'in_progress' && (
        <div className="flex flex-col gap-2.5">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => api.complete(trip.id))}>Finalizar recorrido</button>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={() => run(() => api.cancel(trip.id))}>Cancelar recorrido</button>
        </div>
      )}
      {error && (
        <Uh9Alert variant="danger" title="No se pudo completar la accion"
          message={error} actionLabel="Reintentar" onAction={() => refresh()} disabled={busy} />
      )}
      <Link to="/" className={`text-center text-[11px] font-semibold text-gray-400 ${compact ? '' : 'mt-auto'}`}>Ver como estudiante</Link>
      <BrandFoot />
    </div>
  );
}
