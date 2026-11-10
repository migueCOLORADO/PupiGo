import { useEffect, useMemo, useRef, useState } from 'react';
import { boundsFromPoints } from '../../lib/bounds';
import { mapIndicators, markerIconUrl } from '../../lib/mapMarkers';
import { IDA, REGRESO, toLatLngPath } from '../../lib/routePaths';
import { publishLegend } from './legendStore';
import { loadGoogleMaps, onGoogleMapsAuthFailure } from './loadGoogleMaps';
import { routeZone } from './routeZone';
import { isPositionStale, liveLabel } from './status';

// Trazado real por las calles (lib/routePaths.js) en formato { lat, lng }.
const IDA_PATH = toLatLngPath(IDA);
const REGRESO_PATH = toLatLngPath(REGRESO);
const PATHS = { ida: IDA_PATH, regreso: REGRESO_PATH };

// `lift` sube el icono (px) sin mover su posicion, para no tapar el punto que tiene debajo.
function markerIcon(maps, key, color, size, lift = 0) {
  return { url: markerIconUrl(key, color), scaledSize: new maps.Size(size, size), anchor: new maps.Point(size / 2, size / 2 + lift) };
}

export default function GoogleRouteMap({ trip, direction, mobile = false, apiKey, onFail }) {
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

  // Marcadores, lineas y leyenda (lib/mapMarkers.js). Sin recorrido se usa la direccion recibida.
  const stale = isPositionStale(trip);
  const live = trip?.status === 'in_progress' && !stale;
  const ind = mapIndicators({ trip, direction, station: zone.origin, bounds: zone.bounds, stale });
  const dir = ind.direction;
  const landmarks = ind.markers.filter((m) => m.key !== 'bus');
  const landmarksKey = JSON.stringify(landmarks);
  const bus = ind.markers.find((m) => m.key === 'bus');
  const legendKey = JSON.stringify(ind.legend);

  // Zona delimitada, recorridos de ida y regreso y puntos de la leyenda.
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
    const lines = mapIndicators({ direction: dir }).lines.map((l) => line(PATHS[l.key], l.color, l.selected));
    const points = JSON.parse(landmarksKey).map((m) => new maps.Marker({
      map, position: { lat: m.lat, lng: m.lng }, title: m.title, zIndex: 5, icon: markerIcon(maps, m.key, m.color, 28),
    }));
    overlaysRef.current = [...lines, ...points];
    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [ready, zone, dir, landmarksKey]);

  // Marcador del bus: GPS si hay; sin GPS, al inicio del trazado de la direccion.
  const busLat = bus?.lat, busLng = bus?.lng, busColor = bus?.color, busTitle = bus?.title, busLift = bus?.stackedOn ? 24 : 0;
  useEffect(() => {
    const map = mapRef.current, maps = window.google?.maps;
    if (!ready || !map || !maps) return;
    if (busLat == null || busLng == null) {
      busRef.current?.setMap(null);
      busRef.current = null;
      return;
    }
    const icon = markerIcon(maps, 'bus', busColor, 34, busLift);
    if (!busRef.current) {
      busRef.current = new maps.Marker({ map, position: { lat: busLat, lng: busLng }, icon, title: busTitle, zIndex: 10 });
    } else {
      busRef.current.setPosition({ lat: busLat, lng: busLng });
      busRef.current.setIcon(icon);
      busRef.current.setTitle(busTitle);
    }
  }, [ready, busLat, busLng, busColor, busTitle, busLift]);

  // La leyenda muestra solo lo que esta dibujado en este mapa.
  useEffect(() => {
    if (!ready) return undefined;
    publishLegend(JSON.parse(legendKey));
    return () => publishLegend(null);
  }, [ready, legendKey]);

  return (
    <div className={mobile ? 'm-map' : 'map-wrap'} data-map-provider="google">
      <div ref={divRef} style={{ position: 'absolute', inset: 0 }} aria-label="Mapa del recorrido" />
      <div className={`${mobile ? 'm-live-chip' : 'map-live-chip'}${live ? '' : ' off'}${stale ? ' stale' : ''}`}>
        <span className="pulse" />{liveLabel(trip, mobile)}
      </div>
    </div>
  );
}
