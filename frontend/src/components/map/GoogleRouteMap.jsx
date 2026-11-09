import { useEffect, useMemo, useRef, useState } from 'react';
import { boundsFromPoints, clampToBounds, contains } from '../../lib/bounds';
import { IDA, REGRESO, toLatLngPath } from '../../lib/routePaths';
import { loadGoogleMaps, onGoogleMapsAuthFailure } from './loadGoogleMaps';
import { routeZone } from './routeZone';
import { isPositionStale, liveLabel } from './status';

const COLORS = { ida: '#2563EB', regreso: '#16A34A', stale: '#9AA3B2', waiting: '#F59E0B', white: '#FFFFFF', stop: '#10192B' };
// Trazado real por las calles (lib/routePaths.js) en formato { lat, lng }.
const IDA_PATH = toLatLngPath(IDA);
const REGRESO_PATH = toLatLngPath(REGRESO);

function busPosition(trip, zone) {
  const pos = trip?.last_position;
  const lat = Number(pos?.lat), lng = Number(pos?.lng);
  if (pos && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    const p = { lat, lng };
    // Si el GPS reporta fuera de la zona se muestra en el borde mas cercano (el mapa no sale de ella).
    return contains(zone.bounds, p) ? { ...p, outside: false } : { ...clampToBounds(p, zone.bounds), outside: true };
  }
  if (!trip) return null;
  // Sin lecturas GPS: igual que el SVG, el bus espera en el origen del sentido del recorrido.
  const start = trip.direction === 'vuelta' ? zone.destination : zone.origin;
  return { lat: start.lat, lng: start.lng, outside: false };
}

export default function GoogleRouteMap({ trip, mobile = false, apiKey, onFail }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const busRef = useRef(null);
  const onFailRef = useRef(onFail);
  const [ready, setReady] = useState(false);

  useEffect(() => { onFailRef.current = onFail; }, [onFail]);

  const route = trip?.route;
  const zoneKey = JSON.stringify(route ? [route.origin_lat, route.origin_lng, route.destination_lat, route.destination_lng,
    (route.stops || []).map((s) => [s.lat, s.lng, s.order])] : null);
  // zoneKey resume las coordenadas: la zona solo se recalcula si cambian.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const zone = useMemo(() => routeZone(route), [zoneKey]);

  // Carga del script y creacion del mapa (una vez por montaje).
  useEffect(() => {
    let cancelled = false;
    const fail = (err) => { if (!cancelled) onFailRef.current?.(err); };
    const offAuth = onGoogleMapsAuthFailure(() => fail(new Error('Autenticacion de Google Maps fallida')));
    loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled || !divRef.current) return;
      try {
        mapRef.current = new maps.Map(divRef.current, {
          center: { lat: (zone.bounds.north + zone.bounds.south) / 2, lng: (zone.bounds.east + zone.bounds.west) / 2 },
          zoom: mobile ? 15 : 16,
          restriction: { latLngBounds: zone.bounds, strictBounds: true },
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: mobile ? 'greedy' : 'cooperative',
        });
        setReady(true);
      } catch (e) {
        fail(e);
      }
    }, fail);
    return () => {
      cancelled = true;
      offAuth();
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      busRef.current?.setMap(null);
      busRef.current = null;
      mapRef.current = null;
      setReady(false);
    };
    // El mapa se crea una sola vez; los cambios de zona se aplican en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, mobile]);

  // Zona delimitada, recorridos de ida y regreso y paradas.
  useEffect(() => {
    const map = mapRef.current, maps = window.google?.maps;
    if (!ready || !map || !maps) return;
    map.setOptions({ restriction: { latLngBounds: zone.bounds, strictBounds: true } });
    map.fitBounds(boundsFromPoints([...IDA_PATH, ...REGRESO_PATH], 0.0008));

    // Sentido seleccionado: linea solida con flechas. El otro sentido: linea punteada y tenue.
    const arrow = (color) => ({ path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, strokeColor: color, fillColor: color, fillOpacity: 1 });
    const line = (path, color, selected) => new maps.Polyline(selected
      ? { map, path, strokeColor: color, strokeWeight: 5, strokeOpacity: 0.9, zIndex: 2,
        icons: [{ icon: arrow(color), offset: '12.5%', repeat: '25%' }] }
      : { map, path, strokeOpacity: 0, zIndex: 1,
        icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.45, strokeColor: color, scale: 3 }, offset: '0', repeat: '14px' }] });
    const vuelta = trip?.direction === 'vuelta';
    const ida = line(IDA_PATH, COLORS.ida, !vuelta);
    const regreso = line(REGRESO_PATH, COLORS.regreso, vuelta);
    const stopPoints = [
      { ...zone.origin, label: 'M' },
      ...zone.stops.filter((s) => ![zone.origin, zone.destination].some((e) => Math.abs(e.lat - s.lat) < 1e-7 && Math.abs(e.lng - s.lng) < 1e-7)),
      { ...zone.destination, label: 'E' },
    ];
    const stops = stopPoints.map((s) => new maps.Marker({
      map, position: { lat: s.lat, lng: s.lng }, title: s.name || 'Parada', zIndex: 1,
      label: s.label ? { text: s.label, color: COLORS.white, fontSize: '11px', fontWeight: '700' } : undefined,
      icon: { path: maps.SymbolPath.CIRCLE, scale: s.label ? 10 : 6, fillColor: s.label ? COLORS.stop : COLORS.white, fillOpacity: 1, strokeColor: s.label ? COLORS.white : COLORS.stop, strokeWeight: 2 },
    }));
    overlaysRef.current = [ida, regreso, ...stops];
    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [ready, zone, trip?.direction]);

  // Marcador del bus en su ultima posicion.
  const stale = isPositionStale(trip);
  const live = trip?.status === 'in_progress' && !stale;
  const bus = busPosition(trip, zone);
  const busLat = bus?.lat, busLng = bus?.lng, busOutside = bus?.outside;
  useEffect(() => {
    const map = mapRef.current, maps = window.google?.maps;
    if (!ready || !map || !maps) return;
    if (busLat == null || busLng == null) {
      busRef.current?.setMap(null);
      busRef.current = null;
      return;
    }
    const color = stale ? COLORS.stale : live ? COLORS.ida : COLORS.waiting;
    const icon = { path: maps.SymbolPath.CIRCLE, scale: 11, fillColor: color, fillOpacity: 1, strokeColor: COLORS.white, strokeWeight: 4 };
    const title = busOutside ? 'Pupi Bus (fuera de la zona del recorrido)' : stale ? 'Pupi Bus (última posición conocida)' : 'Pupi Bus';
    if (!busRef.current) {
      busRef.current = new maps.Marker({ map, position: { lat: busLat, lng: busLng }, icon, title, zIndex: 10 });
    } else {
      busRef.current.setPosition({ lat: busLat, lng: busLng });
      busRef.current.setIcon(icon);
      busRef.current.setTitle(title);
    }
  }, [ready, busLat, busLng, busOutside, stale, live]);

  return (
    <div className={mobile ? 'm-map' : 'map-wrap'} data-map-provider="google">
      <div ref={divRef} style={{ position: 'absolute', inset: 0 }} aria-label="Mapa del recorrido" />
      <div className={`${mobile ? 'm-live-chip' : 'map-live-chip'}${live ? '' : ' off'}${stale ? ' stale' : ''}`}>
        <span className="pulse" />{liveLabel(trip, mobile)}
      </div>
    </div>
  );
}
