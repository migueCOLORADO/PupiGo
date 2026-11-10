// UH20: indicadores del mapa de Google (marcadores, lineas y leyenda) como funciones puras.
// La leyenda sale de la misma funcion que decide los marcadores, asi nunca muestra una entrada
// que no este dibujada en el mapa.
import { clampToBounds, contains } from './bounds.js';
import { CALLE_14_SUR_CARRERA_48C, ENTRADA_LAS_HERMOSAS, IDA, REGRESO } from './routePaths.js';

// Colores compartidos con la leyenda (index.css: --blue, --ink, .legend-swatch.stop).
export const COLORS = Object.freeze({
  ida: '#2563EB', regreso: '#16A34A',
  metro: '#2563EB', stop: '#0EA5A5', eafit: '#10192B',
  live: '#2563EB', waiting: '#F59E0B', stale: '#9AA3B2', white: '#FFFFFF',
});

// Estacion Aguacatala del metro segun el seed (backend/tracking/management/commands/seed.py).
export const DEFAULT_STATION = Object.freeze({ lat: 6.19385, lng: -75.58180 });

export const LABELS = Object.freeze({
  bus: 'Pupi Bus',
  metro: 'Estación Aguacatala',
  stop: 'Paradero La Aguacatala',
  eafit: 'Entrada Las Hermosas',
  ida: 'Metro → EAFIT',
  regreso: 'EAFIT → Metro',
});

// Orden de la leyenda.
export const LEGEND_ORDER = Object.freeze(['bus', 'metro', 'stop', 'eafit', 'ida', 'regreso']);

const pt = ([lat, lng]) => ({ lat, lng });

// Distancia haversine en metros entre { lat, lng }.
export function distanceMeters(a, b) {
  const R = 6371008.8, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const STACK_METERS = 10;

export function isValidPoint(p) {
  if (!p || typeof p !== 'object') return false;
  const lat = Number(p.lat), lng = Number(p.lng);
  return p.lat != null && p.lng != null && Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

// Direccion del backend: "ida" o "vuelta". El recorrido manda; sin recorrido se usa `direction`.
export function selectedDirection(trip, direction) {
  const d = trip && typeof trip === 'object' && trip.direction ? trip.direction : direction;
  return d === 'vuelta' ? 'vuelta' : 'ida';
}

// Primer punto del trazado de la direccion: IDA[0] o REGRESO[0].
export function directionStart(direction) {
  return pt(direction === 'vuelta' ? REGRESO[0] : IDA[0]);
}

// Bus: con GPS donde reporte (recortado al borde de la zona si sale de ella); sin GPS y con
// recorrido, al inicio del trazado de la direccion; sin recorrido ni posicion, no se dibuja.
export function busMarker({ trip, direction, bounds, stale = false } = {}) {
  const hasTrip = Boolean(trip) && typeof trip === 'object';
  const pos = hasTrip ? trip.last_position : null;
  const live = hasTrip && trip.status === 'in_progress' && !stale;
  const color = stale ? COLORS.stale : live ? COLORS.live : COLORS.waiting;
  if (isValidPoint(pos)) {
    let p = { lat: Number(pos.lat), lng: Number(pos.lng) }, outside = false;
    try {
      if (bounds && !contains(bounds, p)) { p = clampToBounds(p, bounds); outside = true; }
    } catch { /* limites invalidos: se usa la posicion tal cual */ }
    const title = outside ? 'Pupi Bus (fuera de la zona del recorrido)' : stale ? 'Pupi Bus (última posición conocida)' : LABELS.bus;
    return { key: 'bus', label: LABELS.bus, title, color, ...p, outside, gps: true };
  }
  if (!hasTrip) return null;
  const start = directionStart(selectedDirection(trip, direction));
  return { key: 'bus', label: LABELS.bus, title: LABELS.bus, color, ...start, outside: false, gps: false };
}

// Marcadores, lineas y entradas visibles de la leyenda para un estado del mapa.
export function mapIndicators({ trip = null, direction, station, bounds, stale = false } = {}) {
  const dir = selectedDirection(trip, direction);
  const metro = isValidPoint(station) ? { lat: Number(station.lat), lng: Number(station.lng) } : { ...DEFAULT_STATION };
  const markers = [
    { key: 'metro', label: LABELS.metro, title: LABELS.metro, color: COLORS.metro, ...metro },
    { key: 'stop', label: LABELS.stop, title: LABELS.stop, color: COLORS.stop, ...CALLE_14_SUR_CARRERA_48C },
    { key: 'eafit', label: LABELS.eafit, title: LABELS.eafit, color: COLORS.eafit, ...ENTRADA_LAS_HERMOSAS },
  ];
  const bus = busMarker({ trip, direction: dir, bounds, stale });
  if (bus) {
    // Si el bus queda sobre un punto de la leyenda (p. ej. en espera en el Paradero), se indica para
    // dibujarlo encima sin tapar ese punto.
    const under = markers.find((m) => distanceMeters(m, bus) <= STACK_METERS);
    markers.push({ ...bus, stackedOn: under ? under.key : null });
  }
  const lines = [
    { key: 'ida', label: LABELS.ida, color: COLORS.ida, path: IDA, selected: dir === 'ida' },
    { key: 'regreso', label: LABELS.regreso, color: COLORS.regreso, path: REGRESO, selected: dir === 'vuelta' },
  ];
  const byKey = new Map([
    ...markers.map((m) => [m.key, { key: m.key, type: 'marker', label: m.label, color: m.color }]),
    ...lines.map((l) => [l.key, { key: l.key, type: 'line', label: l.label, color: l.color, dashed: !l.selected }]),
  ]);
  const legend = LEGEND_ORDER.filter((k) => byKey.has(k)).map((k) => byKey.get(k));
  return { direction: dir, markers, lines, legend };
}

// Glifos de la leyenda (components/map/icons.jsx: LegendBus, LegendMetro, LegendStop, LegendEafit).
export const GLYPHS = Object.freeze({
  bus: '<rect x="3" y="5" width="18" height="12" rx="3"/><line x1="3" y1="10" x2="21" y2="10"/>',
  metro: '<rect x="4" y="4" width="16" height="14" rx="4"/>',
  stop: '<rect x="3" y="6" width="18" height="10" rx="2"/>',
  eafit: '<path d="M4 9l8-4 8 4"/>',
});

// Icono del marcador: circulo del color de la leyenda con el mismo glifo en blanco.
export function markerIconSvg(key, color) {
  const glyph = GLYPHS[key];
  if (!glyph) throw new TypeError(`marcador desconocido: ${key}`);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'
    + `<circle cx="16" cy="16" r="14" fill="${color}" stroke="#FFFFFF" stroke-width="3"/>`
    + '<g transform="translate(8 8) scale(0.6667)" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round">'
    + `${glyph}</g></svg>`;
}

export function markerIconUrl(key, color) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerIconSvg(key, color))}`;
}
