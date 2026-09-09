import { Link } from 'react-router-dom';
import { useNow } from '../hooks/useNow';
import { etaMinutes } from '../lib/geo';
import { formatAgo, secondsSince } from '../lib/time';
import { NAMES } from './map/geometry';
import { DirArrow, IconClock, IconInfo, IconRefresh } from './map/icons';
import StatusChip, { STATUS_LABEL } from './StatusChip';

function useTripInfo(trip) {
  const now = useNow();
  const pos = trip?.last_position;
  const eta = trip?.status === 'in_progress' ? etaMinutes(pos, trip.route, trip.direction) : null;
  const ago = secondsSince(pos?.timestamp, now);
  return { eta, ago };
}

function endedNote(lastEnded) {
  if (!lastEnded) return null;
  const s = lastEnded.status;
  if (s === 'cancelled') return 'El conductor canceló el último recorrido. Ya no hay un colectivo activo.';
  if (s === 'completed') return 'El último recorrido finalizó. Espera el próximo colectivo.';
  return null;
}

export default function StudentPanel({ trip, lastEnded, compact, mobile }) {
  const { eta, ago } = useTripInfo(trip);
  const dir = trip?.direction || 'ida';
  const n = mobile ? 'short' : 'long';
  const start = dir === 'vuelta' ? NAMES.eafit[n] : NAMES.metro[n];
  const end = dir === 'vuelta' ? NAMES.metro[n] : NAMES.eafit[n];
  const sub = trip
    ? trip.status === 'waiting' ? 'El colectivo está en el punto de salida, aún no inicia' : 'Dirección del recorrido activo'
    : (endedNote(lastEnded) || 'No hay un recorrido activo en este momento');
  const off = trip ? '' : ' off';

  if (compact) {
    return (
      <>
        <div className={`m-card-primary${off}`}>
          <div className="m-row-top">
            <div className="m-direction">
              <span className="stop start">{start}</span><DirArrow flipped={dir === 'vuelta'} sw={2.6} /><span className="stop end">{end}</span>
            </div>
            <StatusChip compact status={trip?.status} />
          </div>
          <div className="m-sub">{sub}</div>
        </div>
        <div className="m-row-cards">
          <div className="m-mini-card"><div className="m-mini-icon blue"><IconClock /></div>
            <div className="m-mini-text"><div className="v">{eta != null ? `${eta} min` : '—'}</div><div className="l">ETA</div></div></div>
          <div className="m-mini-card"><div className="m-mini-icon gray"><IconRefresh /></div>
            <div className="m-mini-text"><div className="v">{formatAgo(ago)}</div><div className="l">Actualizado</div></div></div>
        </div>
        {mobile && <Link to="/conductor" className="text-center text-[11px] font-semibold text-gray-400">Soy el conductor</Link>}
      </>
    );
  }

  return (
    <>
      <div className="panel-title">Recorrido actual</div>
      <div className={`card card-primary${off}`}>
        <div className="row-top"><StatusChip status={trip?.status} /></div>
        <div className="direction-row">
          <span className="stop start">{start}</span><DirArrow flipped={dir === 'vuelta'} /><span className="stop end">{end}</span>
        </div>
        <div className="direction-sub">{sub}</div>
      </div>
      <div className="card card-eta">
        <div className="eta-icon"><IconClock /></div>
        <div><div className="eta-num">{eta != null ? <>{eta}<span>min</span></> : '—'}</div><div className="eta-label">Tiempo estimado de llegada</div></div>
      </div>
      <div className="card card-update">
        <div className="update-icon"><IconRefresh /></div>
        <div className="update-text"><div className="t1">{formatAgo(ago, true)}</div><div className="t2">Última actualización</div></div>
      </div>
      <div className="info-note">
        <IconInfo />
        <span>La posición se actualiza automáticamente. Ruta fija entre la Estación Aguacatala y la Entrada Las Hermosas, pasando por el paradero de buses de la Aguacatala.</span>
      </div>
      <Link to="/conductor" className="text-center text-[11px] font-semibold text-gray-400">Soy el conductor</Link>
    </>
  );
}

export { STATUS_LABEL };
