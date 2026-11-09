import { boundsFromPoints } from '../../lib/bounds.js';
import { ROUTE_POINTS } from '../../lib/routePaths.js';

// UH20: zona de los recorridos de ida y regreso. Si la ruta llega por la API se usan sus
// coordenadas (origen, destino y paradas); si faltan o son invalidas se usan las del seed
// (backend/tracking/management/commands/seed.py).
export const SEED_ROUTE = {
  origin_name: 'Estación Aguacatala', origin_lat: 6.19385, origin_lng: -75.58180,
  destination_name: 'Entrada Las Hermosas', destination_lat: 6.19960, destination_lng: -75.57850,
};

// Margen alrededor de la ruta en grados (~440 m), suficiente para ver las calles vecinas.
export const ZONE_MARGIN_DEG = 0.004;
// Margen adicional solo al este y al oeste (~660 m) para que, en un mapa de escritorio de 1440x900,
// el zoom 16 quepa dentro de strictBounds y se vean IDA y REGRESO completos.
export const ZONE_EXTRA_LNG_DEG = 0.006;

const valid = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng)
  && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

function endpoint(route, prefix) {
  const lat = Number(route?.[`${prefix}_lat`]), lng = Number(route?.[`${prefix}_lng`]);
  if (route && route[`${prefix}_lat`] != null && route[`${prefix}_lng`] != null && valid(lat, lng)) {
    return { lat, lng, name: route[`${prefix}_name`] };
  }
  return { lat: SEED_ROUTE[`${prefix}_lat`], lng: SEED_ROUTE[`${prefix}_lng`], name: SEED_ROUTE[`${prefix}_name`] };
}

export function routeZone(route) {
  const origin = endpoint(route, 'origin');
  const destination = endpoint(route, 'destination');
  const stops = (Array.isArray(route?.stops) ? route.stops : [])
    .map((s) => ({ name: s?.name, order: s?.order, lat: Number(s?.lat), lng: Number(s?.lng) }))
    .filter((s) => valid(s.lat, s.lng))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  // Los limites incluyen todos los puntos del trazado real (lib/routePaths.js), por ejemplo el
  // retorno bajo el puente de la Calle 4 Sur, para que strictBounds no corte ningun recorrido.
  const base = boundsFromPoints([origin, destination, ...stops, ...ROUTE_POINTS], ZONE_MARGIN_DEG);
  // La zona es mas alta que ancha; con strictBounds un mapa ancho (escritorio) no podria alejarse lo
  // suficiente para ver ambos recorridos completos. Se amplia solo el margen este-oeste.
  const bounds = {
    ...base,
    east: Math.min(180, base.east + ZONE_EXTRA_LNG_DEG),
    west: Math.max(-180, base.west - ZONE_EXTRA_LNG_DEG),
  };
  return { origin, destination, stops, bounds };
}
