import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { COLLAPSED, EXPANDED, dragHeight, resolveSheet, sheetHeights, toggleSheet } from '../lib/sheet';
import Legend from './map/Legend';
import RouteMap from './map/RouteMap';
import { MobileTopBar, TopBar } from './TopBar';

function useViewportHeight() {
  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const on = () => setVh(window.innerHeight);
    window.addEventListener('resize', on);
    window.visualViewport?.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.visualViewport?.removeEventListener('resize', on);
    };
  }, []);
  return vh;
}

// UH18: tarjeta inferior movil. Se arrastra con pointer events desde el asa (touch-action: none)
// y el boton accesible alterna entre contraida y expandida. Contraida deja >= 60 % del alto para el mapa.
function MobileSheet({ children }) {
  const vh = useViewportHeight();
  const [state, setState] = useState(COLLAPSED);
  const sheetRef = useRef(null);
  const drag = useRef(null);
  const heights = sheetHeights(vh);
  const expanded = state === EXPANDED;

  const setHeight = (h) => { if (sheetRef.current) sheetRef.current.style.height = `${h}px`; };

  const onPointerDown = (e) => {
    if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, y0: e.clientY, samples: [{ y: e.clientY, t: e.timeStamp }] };
    sheetRef.current?.classList.add('dragging');
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.samples = [...d.samples.filter((s) => e.timeStamp - s.t < 120), { y: e.clientY, t: e.timeStamp }];
    setHeight(dragHeight(state, e.clientY - d.y0, vh));
  };
  const onPointerEnd = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const first = d.samples[0];
    const dt = e.timeStamp - first.t;
    const velocity = dt > 0 ? (e.clientY - first.y) / dt : 0;
    const r = resolveSheet({ state, delta: e.clientY - d.y0, velocity, viewportHeight: vh });
    sheetRef.current?.classList.remove('dragging');
    setHeight(r.height);
    setState(r.state);
  };
  const toggle = () => {
    const next = toggleSheet(state);
    setHeight(next === EXPANDED ? heights.expanded : heights.collapsed);
    setState(next);
  };

  return (
    <section ref={sheetRef} className="sheet" data-state={state} aria-label="Detalles del recorrido"
      style={{ height: expanded ? heights.expanded : heights.collapsed }}>
      <div className="sheet-grip" onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
        <div className="sheet-handle" aria-hidden="true" />
        <button type="button" className="sheet-toggle" aria-expanded={expanded} aria-controls="sheet-body" onClick={toggle}>
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>
      <div id="sheet-body" className="sheet-body">{children}</div>
    </section>
  );
}

// Breakpoints: < 768 mobile (sheet inferior), 768-1023 tablet (mapa arriba, barra abajo), >= 1024 desktop (74/26).
// `panel(compact, mobile)` renderiza el contenido lateral/inferior segun el layout.
export default function AppShell({ trip, direction, onDirectionChange, canToggle, panel }) {
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const bar = { trip, direction, onDirectionChange, canToggle };

  if (!isMd) {
    return (
      <div className="pupi-app m-app">
        <MobileTopBar {...bar} />
        <RouteMap mobile trip={trip} direction={direction} />
        <MobileSheet>{panel(true, true)}</MobileSheet>
      </div>
    );
  }
  if (!isLg) {
    return (
      <div className="tablet-app pupi-app">
        <TopBar {...bar} />
        <div className="tablet-map-wrap"><RouteMap trip={trip} direction={direction} /><Legend /></div>
        <div className="tablet-infobar">{panel(true, false)}</div>
      </div>
    );
  }
  return (
    <div className="app pupi-app">
      <TopBar {...bar} />
      <div className="app-body">
        <div className="map-col"><RouteMap trip={trip} direction={direction} /><Legend /></div>
        <div className="side-col">{panel(false, false)}</div>
      </div>
    </div>
  );
}
