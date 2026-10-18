import { useRef } from 'react';
import { useSvgProjector } from '../../hooks/useSvgProjector';
import { routeProgress } from '../../lib/geo';
import { DESKTOP, MOBILE, NAMES } from './geometry';
import { IconCompass, IconMinus, IconNav, IconPinLoc, IconPlus } from './icons';
import { BusMarker, Pin } from './Markers';
import { DesktopStreets, MobileStreets } from './Streets';

export function liveLabel(trip, mobile) {
  if (!trip) return 'Sin recorrido activo';
  if (trip.status === 'waiting') return mobile ? 'Pupi Bus en espera' : 'En espera';
  return mobile ? 'Pupi Bus en camino' : 'En vivo';
}

export default function RouteMap({ trip, mobile = false }) {
  const containerRef = useRef(null), svgRef = useRef(null), pathRef = useRef(null);
  const project = useSvgProjector(svgRef, containerRef);
  const G = mobile ? MOBILE : DESKTOP;
  const P = (pt) => project(pt.x, pt.y);
  const live = trip?.status === 'in_progress';

  let busPos = null;
  if (trip && pathRef.current) {
    const pos = trip.last_position;
    const t = pos ? routeProgress(pos, trip.route) : (trip.direction === 'vuelta' ? 1 : 0);
    const path = pathRef.current;
    const p = path.getPointAtLength(t * path.getTotalLength());
    busPos = project(p.x, p.y);
  }

  const Streets = mobile ? MobileStreets : DesktopStreets;
  return (
    <div ref={containerRef} className={mobile ? 'm-map' : 'map-wrap'}>
      <Streets svgRef={svgRef} pathRef={pathRef} />

      {mobile ? (
        <div className="m-map-controls">
          <div className="m-map-btn"><IconPlus /></div>
          <div className="m-map-btn"><IconNav /></div>
        </div>
      ) : (
        <>
          <div className="map-badge"><IconPinLoc />El Poblado, Medellín</div>
          <div className="map-sub">Ruta fija · vía Av. Regional</div>
          <div className="map-controls">
            <div className="map-btn primary"><IconPlus width="16" height="16" /></div>
            <div className="map-btn"><IconMinus width="16" height="16" /></div>
            <div className="map-btn"><IconNav width="15" height="15" /></div>
          </div>
          <div className="map-compass"><IconCompass /></div>
          <div className="map-scale"><span>500 m</span><span className="bar" /></div>
        </>
      )}

      <Pin kind="metro" pos={P(G.stops.metro)} simple={mobile} caption={!mobile && NAMES.metro.long} />
      <Pin kind="stop" minor pos={P(G.stops.paradero)} simple={mobile}
        caption={!mobile && <>Paradero de buses<br />La Aguacatala</>} />
      <Pin kind="eafit" pos={P(G.stops.eafit)} simple={mobile} caption={!mobile && NAMES.eafit.long} />
      <BusMarker pos={busPos} live={live} simple={mobile} />

      <div className={`${mobile ? 'm-live-chip' : 'map-live-chip'}${live ? '' : ' off'}`}>
        <span className="pulse" />{liveLabel(trip, mobile)}
      </div>
    </div>
  );
}
