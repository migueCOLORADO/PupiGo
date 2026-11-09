// UH20: logica pura de limites geograficos (sin dependencias de React ni de Google Maps).
// Los limites usan el mismo formato que google.maps.LatLngBoundsLiteral: { north, south, east, west }.
// No se soportan zonas que crucen el antimeridiano (no aplica a Medellin).

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function assertPoint(point, label = 'point') {
  if (!point || typeof point !== 'object') throw new TypeError(`${label} debe ser un objeto { lat, lng }`);
  const { lat, lng } = point;
  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) throw new TypeError(`${label} requiere lat y lng numericos finitos`);
  if (lat < -90 || lat > 90) throw new RangeError(`${label}.lat fuera de rango (-90 a 90)`);
  if (lng < -180 || lng > 180) throw new RangeError(`${label}.lng fuera de rango (-180 a 180)`);
}

function assertBounds(bounds) {
  if (!bounds || typeof bounds !== 'object') throw new TypeError('bounds debe ser un objeto { north, south, east, west }');
  const { north, south, east, west } = bounds;
  if (![north, south, east, west].every(isFiniteNumber)) throw new TypeError('bounds requiere north, south, east y west numericos finitos');
  if (south > north) throw new RangeError('bounds invalido: south > north');
  if (west > east) throw new RangeError('bounds invalido: west > east');
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Rectangulo minimo que contiene todos los puntos, ampliado `margin` grados por cada lado
// y recortado al rango valido de latitud/longitud.
export function boundsFromPoints(points, margin = 0) {
  if (!Array.isArray(points) || points.length === 0) throw new TypeError('points debe ser un arreglo no vacio');
  if (!isFiniteNumber(margin) || margin < 0) throw new RangeError('margin debe ser un numero finito >= 0');
  let north = -Infinity, south = Infinity, east = -Infinity, west = Infinity;
  points.forEach((p, i) => {
    assertPoint(p, `points[${i}]`);
    north = Math.max(north, p.lat);
    south = Math.min(south, p.lat);
    east = Math.max(east, p.lng);
    west = Math.min(west, p.lng);
  });
  return {
    north: clamp(north + margin, -90, 90),
    south: clamp(south - margin, -90, 90),
    east: clamp(east + margin, -180, 180),
    west: clamp(west - margin, -180, 180),
  };
}

// true si el punto esta dentro de los limites (bordes incluidos).
export function contains(bounds, point) {
  assertBounds(bounds);
  assertPoint(point);
  return point.lat >= bounds.south && point.lat <= bounds.north
    && point.lng >= bounds.west && point.lng <= bounds.east;
}

// Punto mas cercano dentro de los limites. Si ya esta dentro, se devuelve con los mismos valores.
export function clampToBounds(point, bounds) {
  assertBounds(bounds);
  assertPoint(point);
  return {
    ...point,
    lat: clamp(point.lat, bounds.south, bounds.north),
    lng: clamp(point.lng, bounds.west, bounds.east),
  };
}
