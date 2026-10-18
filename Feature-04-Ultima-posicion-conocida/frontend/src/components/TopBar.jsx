import logo from '../assets/logo.png';
import DirToggle from './DirToggle';
import { isPositionStale } from './map/RouteMap';

// UH4: la pildora de estado usa la misma regla que el mapa (isPositionStale), asi ambas
// indicaciones siempre coinciden:
//   - "En vivo":       recorrido en curso con posiciones frescas.
//   - "Sin conexión":  fallo el polling al servidor (el mapa conserva la ultima posicion).
//   - "Sin señal":     sin recorrido en curso o sin posiciones recientes del GPS.
function pillState(trip) {
  const live = trip?.status === 'in_progress' && !trip.connection_lost && !isPositionStale(trip);
  const label = live ? 'En vivo' : trip?.connection_lost ? 'Sin conexión' : 'Sin señal';
  return { live, label };
}

export function TopBar({ trip, direction, onDirectionChange, canToggle }) {
  const { live, label } = pillState(trip);
  return (
    <div className="topbar">
      <div className="brand">
        <img className="logo" src={logo} alt="PupiGo" />
        <div className="brand-text"><p>Seguimiento en tiempo real</p></div>
      </div>
      <div className="topbar-right">
        <DirToggle direction={direction} onChange={onDirectionChange} disabled={!canToggle} />
        <div className={`live-pill${live ? '' : ' off'}`}><span className="pulse" />{label}</div>
      </div>
    </div>
  );
}

export function MobileTopBar({ trip, direction, onDirectionChange, canToggle }) {
  const { live, label } = pillState(trip);
  return (
    <>
      <div className="m-topbar">
        <div className="m-brand"><img className="logo" src={logo} alt="PupiGo" /></div>
        <div className={`m-live${live ? '' : ' off'}`}><span className="pulse" />{label}</div>
      </div>
      <div className="px-[18px] pb-[10px]">
        <DirToggle mobile direction={direction} onChange={onDirectionChange} disabled={!canToggle} />
      </div>
    </>
  );
}