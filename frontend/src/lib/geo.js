// Utilidades geograficas para la ruta fija Aguacatala <-> Las Hermosas.

// Avance 0..1 del punto GPS a lo largo del segmento origen -> destino de la ruta.
// Siempre se mide desde Aguacatala (0) hacia EAFIT (1), que es como esta dibujado el path SVG.
export function routeProgress(pos, route) {
  if (!pos || !route) return null;
  const k = Math.cos((route.origin_lat * Math.PI) / 180);
  const ax = route.origin_lng * k, ay = route.origin_lat;
  const bx = route.destination_lng * k, by = route.destination_lat;
  const px = pos.lng * k, py = pos.lat;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (!len2) return 0;
  const t = ((px - ax) * dx + (py - ay) * dy) / len2;
  return Math.min(1, Math.max(0, t));
}

export function distanceMeters(a, b) {
  const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ETA naive: distancia en linea recta al destino del recorrido / velocidad promedio urbana.
export function etaMinutes(pos, route, direction, speedKmh = 20) {
  if (!pos || !route) return null;
  const dest = direction === 'vuelta'
    ? { lat: route.origin_lat, lng: route.origin_lng }
    : { lat: route.destination_lat, lng: route.destination_lng };
  return Math.max(1, Math.round((distanceMeters(pos, dest) / 1000 / speedKmh) * 60));
}
