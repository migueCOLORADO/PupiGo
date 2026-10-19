/*
 * StudentPanel - panel del estudiante (vista compacta/movil + vista escritorio).
 *
 * RF-11 (Feature 7 "Direccion del colectivo"):
 * "El sistema debe mostrar el nombre del conductor designado con el ID de la ruta
 *  y la placa del vehiculo, para cada ruta."
 *
 * Que agrego la Feature 7 en este archivo (todo aditivo, sobre la version de Sprint-3
 * que ya traia la Feature 9 / UH-9 de identidad de marca e interfaz):
 *  1. El helper `vehiclePlate()` para sacar la placa del campo `trip.vehicle`.
 *  2. El helper `assignmentInfo()` que arma los 3 datos del RF-11 ya normalizados
 *     (conductor, placa, ruta) con "—" cuando no hay recorrido activo.
 *  3. Un bloque nuevo en LAS DOS vistas: una mini-card en la compacta/movil y una
 *     card "Colectivo asignado" en la de escritorio.
 *
 * No se toco nada de la Feature 9: los Uh9Alert, los StatusHelp y los BrandFoot de
 * ambas vistas quedan donde estaban.
 *
 * Por que asi: los datos YA llegaban del backend en GET /api/trips/active/
 * (TripSerializer expone `driver`, `vehicle` y `route`), solo faltaba pintarlos;
 * por eso no se toco el backend ni se agregaron dependencias. Se reutilizan las
 * clases que ya existen en index.css (`card`, `panel-title`, `m-row-cards`,
 * `m-mini-card`, `m-mini-text`) para no inventar estilos nuevos.
 */
import { Link } from 'react-router-dom';
import { useNow } from '../hooks/useNow';
import { etaMinutes } from '../lib/geo';
import { formatAgo, secondsSince } from '../lib/time';
import { NAMES } from './map/geometry';
import { DirArrow, IconClock, IconInfo, IconRefresh } from './map/icons';
import { isPositionStale } from './map/RouteMap';
import StatusChip, { STATUS_LABEL } from './StatusChip';
import StatusHelp from './StatusHelp';
import { BrandFoot } from './BrandSlogan';
import Uh9Alert from './Uh9Alert';
import AssistantPanel from './AssistantPanel';

// Placeholder unico para los datos del RF-11 cuando no hay recorrido activo.
const SIN_DATO = '—';

function useTripInfo(trip) {
  const now = useNow();
  const pos = trip?.last_position;
  // UH4: con la posicion desactualizada el ETA se oculta; un ETA congelado engaña al estudiante.
  const stale = isPositionStale(trip);
  const eta = trip?.status === 'in_progress' && !stale ? etaMinutes(pos, trip.route, trip.direction) : null;
  const ago = secondsSince(pos?.timestamp, now);
  return { eta, ago, stale };
}

function endedNote(lastEnded) {
  if (!lastEnded) return null;
  const s = lastEnded.status;
  if (s === 'cancelled') return 'El conductor canceló el último recorrido. Ya no hay un colectivo activo.';
  if (s === 'completed') return 'El último recorrido finalizó. Espera el próximo colectivo.';
  return null;
}

/*
 * RF-11: `trip.vehicle` NO es un objeto, es el string que arma Vehicle.__str__ en
 * el backend -> "Pupi Bus (ABC123)". O sea que no existe `trip.vehicle.plate` y la
 * placa hay que sacarla del parentesis. Lo hacemos de forma defensiva: si el
 * formato cambia (o no viene el parentesis) devolvemos el string completo en vez
 * de romper la vista o mostrar vacio.
 */
function vehiclePlate(vehicle) {
  if (typeof vehicle !== 'string') return null;
  const texto = vehicle.trim();
  if (!texto) return null;
  const conParentesis = texto.match(/\(([^()]+)\)\s*$/);
  return conParentesis ? conParentesis[1].trim() : texto;
}

/*
 * RF-11: deja listos los 3 datos que pide el requisito. Todo pasa por `trip?.`
 * porque el componente recibe `trip = null` cuando no hay recorrido activo; en ese
 * caso se degrada a "—" y nunca se pinta undefined/null.
 * El id de la ruta va en la etiqueta ("Ruta #1") para no ensuciar el nombre.
 */
function assignmentInfo(trip) {
  const routeId = trip?.route?.id;
  return {
    driver: trip?.driver || SIN_DATO,
    plate: vehiclePlate(trip?.vehicle) || SIN_DATO,
    route: trip?.route?.name || SIN_DATO,
    routeLabel: routeId != null ? `Ruta #${routeId}` : 'Ruta',
  };
}

export default function StudentPanel({ trip, lastEnded, compact, mobile, error, onRetry }) {
  const { eta, ago, stale } = useTripInfo(trip);
  const dir = trip?.direction || 'ida';
  const n = mobile ? 'short' : 'long';
  const start = dir === 'vuelta' ? NAMES.eafit[n] : NAMES.metro[n];
  const end = dir === 'vuelta' ? NAMES.metro[n] : NAMES.eafit[n];
  const sub = trip
    ? trip.status === 'waiting'
      ? 'El colectivo está en el punto de salida, aún no inicia'
      : stale
        ? 'Sin señal GPS reciente. Se muestra la última posición conocida del colectivo'
        : 'Dirección del recorrido activo'
    : (endedNote(lastEnded) || 'No hay un recorrido activo en este momento');
  const off = trip ? '' : ' off';
  // RF-11: conductor / placa / ruta del recorrido activo.
  const asignacion = assignmentInfo(trip);

  if (compact) {
    return (
      <>
        {error && (
          <Uh9Alert variant="danger" title="No pudimos actualizar la informacion"
            message="Revisa tu conexion. La posicion del colectivo puede estar desactualizada."
            actionLabel="Reintentar" onAction={onRetry} />
        )}
        <div className={`m-card-primary${off}`}>
          <div className="m-row-top">
            <div className="m-direction">
              <span className="stop start">{start}</span><DirArrow flipped={dir === 'vuelta'} sw={2.6} /><span className="stop end">{end}</span>
            </div>
            <div className="flex items-center gap-2"><StatusHelp current={trip?.status} /><StatusChip compact status={trip?.status} /></div>
          </div>
          <div className="m-sub">{sub}</div>
        </div>
        <div className="m-row-cards">
          <div className="m-mini-card"><div className="m-mini-icon blue"><IconClock /></div>
            <div className="m-mini-text"><div className="v">{eta != null ? `${eta} min` : '—'}</div><div className="l">ETA</div></div></div>
          <div className="m-mini-card"><div className="m-mini-icon gray"><IconRefresh /></div>
            <div className="m-mini-text"><div className="v">{formatAgo(ago)}</div><div className="l">Actualizado</div></div></div>
        </div>
        {/*
          RF-11 (vista compacta/movil y tablet): una sola mini-card con los 3 datos
          apilados. Se usa `m-row-cards` + `m-mini-card` para que en movil quede como
          otra fila del sheet y en tablet como otra columna de `.tablet-infobar`
          (ambas reglas ya existen en index.css). Se mantiene el orden valor-arriba /
          etiqueta-abajo de las mini-cards de ETA y Actualizado.
        */}
        <div className="m-row-cards">
          <div className="m-mini-card">
            <div className="m-mini-text flex flex-1 flex-col gap-2">
              <div><div className="v">{asignacion.driver}</div><div className="l">Conductor</div></div>
              <div><div className="v">{asignacion.plate}</div><div className="l">Placa</div></div>
              <div><div className="v">{asignacion.route}</div><div className="l">{asignacion.routeLabel}</div></div>
            </div>
          </div>
        </div>
        <AssistantPanel />
        {mobile && <Link to="/conductor" className="text-center text-[11px] font-semibold text-gray-400">Soy el conductor</Link>}
        <BrandFoot />
      </>
    );
  }

  return (
    <>
      <div className="panel-title">Recorrido actual</div>
      {error && (
        <Uh9Alert variant="danger" title="No pudimos actualizar la informacion"
          message="Revisa tu conexion. La posicion del colectivo puede estar desactualizada."
          actionLabel="Reintentar" onAction={onRetry} />
      )}
      <div className={`card card-primary${off}`}>
        <div className="row-top"><StatusChip status={trip?.status} /><StatusHelp current={trip?.status} /></div>
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
      {/*
        RF-11 (vista escritorio): titulo con `panel-title` + una `card` con una fila
        por dato (etiqueta a la izquierda, valor a la derecha). Las utilidades de
        Tailwind usan la paleta de tailwind.config.js (text-gray-400 / text-ink) para
        que coincida con la tipografia de las demas cards.
      */}
      <div className="panel-title">Colectivo asignado</div>
      <div className="card flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] font-semibold text-gray-400">Conductor</span>
          <span className="text-right text-[13px] font-bold text-ink">{asignacion.driver}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] font-semibold text-gray-400">Placa</span>
          <span className="text-right text-[13px] font-bold text-ink">{asignacion.plate}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] font-semibold text-gray-400">{asignacion.routeLabel}</span>
          <span className="text-right text-[13px] font-bold text-ink">{asignacion.route}</span>
        </div>
      </div>
      <div className="info-note">
        <IconInfo />
        <span>La posición se actualiza automáticamente. Ruta fija entre la Estación Aguacatala y la Entrada Las Hermosas, pasando por el paradero de buses de la Aguacatala.</span>
      </div>
      <AssistantPanel />
      <Link to="/conductor" className="text-center text-[11px] font-semibold text-gray-400">Soy el conductor</Link>
      <BrandFoot />
    </>
  );
}

export { STATUS_LABEL };
