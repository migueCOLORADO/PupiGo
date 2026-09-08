import { useMediaQuery } from '../hooks/useMediaQuery';
import Legend from './map/Legend';
import RouteMap from './map/RouteMap';
import { MobileTopBar, TopBar } from './TopBar';

// Breakpoints: < 768 mobile (sheet inferior), 768-1023 tablet (mapa arriba, barra abajo), >= 1024 desktop (74/26).
// `panel(compact, mobile)` renderiza el contenido lateral/inferior segun el layout.
export default function AppShell({ trip, direction, onDirectionChange, canToggle, panel }) {
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const bar = { trip, direction, onDirectionChange, canToggle };

  if (!isMd) {
    return (
      <div className="pupi-app flex h-full min-h-0 flex-col bg-white">
        <MobileTopBar {...bar} />
        <RouteMap mobile trip={trip} />
        <div className="sheet"><div className="sheet-handle" />{panel(true, true)}</div>
      </div>
    );
  }
  if (!isLg) {
    return (
      <div className="tablet-app pupi-app">
        <TopBar {...bar} />
        <div className="tablet-map-wrap"><RouteMap trip={trip} /><Legend /></div>
        <div className="tablet-infobar">{panel(true, false)}</div>
      </div>
    );
  }
  return (
    <div className="app pupi-app">
      <TopBar {...bar} />
      <div className="app-body">
        <div className="map-col"><RouteMap trip={trip} /><Legend /></div>
        <div className="side-col">{panel(false, false)}</div>
      </div>
    </div>
  );
}
