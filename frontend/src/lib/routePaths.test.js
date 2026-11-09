// Ejecutar desde frontend/: node --test src/lib/routePaths.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampToBounds, contains } from './bounds.js';
import {
  CALLE_14_SUR_CARRERA_48C, ENTRADA_LAS_HERMOSAS, IDA, REGRESO, ROUTE_POINTS, toLatLngPath,
} from './routePaths.js';
import { routeZone, SEED_ROUTE } from '../components/map/routeZone.js';

const R = 6371008.8;
const rad = (d) => (d * Math.PI) / 180;
// Distancia haversine en metros entre { lat, lng }.
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const pt = ([lat, lng]) => ({ lat, lng });
const ROUTES = { IDA, REGRESO };
const ZONES = {
  'zona por defecto (sin ruta)': routeZone(null),
  'zona con la ruta del seed': routeZone({ ...SEED_ROUTE, stops: [
    { name: SEED_ROUTE.origin_name, order: 1, lat: SEED_ROUTE.origin_lat, lng: SEED_ROUTE.origin_lng },
    { name: SEED_ROUTE.destination_name, order: 2, lat: SEED_ROUTE.destination_lat, lng: SEED_ROUTE.destination_lng },
  ] }),
};

test('recorridos: forma valida y coordenadas en Medellin', () => {
  for (const [name, path] of Object.entries(ROUTES)) {
    assert.ok(Object.isFrozen(path), `${name} debe ser inmutable`);
    assert.ok(path.length >= 20, `${name} tiene muy pocos puntos (${path.length})`);
    path.forEach((p, i) => {
      assert.ok(Array.isArray(p) && p.length === 2, `${name}[${i}] no es [lat, lng]`);
      assert.ok(p.every(Number.isFinite), `${name}[${i}] no es numerico`);
      assert.ok(p[0] > 6.18 && p[0] < 6.21 && p[1] > -75.59 && p[1] < -75.57, `${name}[${i}] fuera del sector`);
    });
  }
  assert.equal(ROUTE_POINTS.length, IDA.length + REGRESO.length);
});

test('recorridos: todos los puntos dentro de los limites de la zona', () => {
  for (const [zoneName, zone] of Object.entries(ZONES)) {
    for (const [name, path] of Object.entries(ROUTES)) {
      path.forEach((p, i) => assert.ok(contains(zone.bounds, pt(p)), `${zoneName}: ${name}[${i}] fuera de los limites`));
    }
  }
});

test('borde: inicio de IDA y fin de REGRESO a 30 m o menos de Calle 14 Sur con Carrera 48C', () => {
  const dIda = haversine(pt(IDA[0]), CALLE_14_SUR_CARRERA_48C);
  const dReg = haversine(pt(REGRESO[REGRESO.length - 1]), CALLE_14_SUR_CARRERA_48C);
  assert.ok(dIda <= 30, `inicio de IDA a ${dIda.toFixed(1)} m`);
  assert.ok(dReg <= 30, `fin de REGRESO a ${dReg.toFixed(1)} m`);
});

test('borde: fin de IDA e inicio de REGRESO a 30 m o menos de la entrada Las Hermosas', () => {
  const dIda = haversine(pt(IDA[IDA.length - 1]), ENTRADA_LAS_HERMOSAS);
  const dReg = haversine(pt(REGRESO[0]), ENTRADA_LAS_HERMOSAS);
  assert.ok(dIda <= 30, `fin de IDA a ${dIda.toFixed(1)} m`);
  assert.ok(dReg <= 30, `inicio de REGRESO a ${dReg.toFixed(1)} m`);
});

test('recorridos: sin saltos mayores a 60 m ni puntos repetidos entre puntos consecutivos', () => {
  for (const [name, path] of Object.entries(ROUTES)) {
    for (let i = 1; i < path.length; i++) {
      const d = haversine(pt(path[i - 1]), pt(path[i]));
      assert.ok(d <= 60, `${name}: salto de ${d.toFixed(1)} m entre ${i - 1} y ${i}`);
      assert.ok(d > 0, `${name}: punto repetido en ${i}`);
    }
  }
});

test('recorridos: van en sentido contrario (IDA hacia el norte, REGRESO hacia el sur al final)', () => {
  assert.ok(IDA[IDA.length - 1][0] > IDA[0][0], 'IDA debe terminar al norte de su inicio');
  assert.ok(REGRESO[REGRESO.length - 1][0] < REGRESO[0][0], 'REGRESO debe terminar al sur de su inicio');
  // El regreso da la vuelta por debajo del puente de la Calle 4 Sur, al norte de Las Hermosas.
  const maxLat = Math.max(...REGRESO.map((p) => p[0]));
  assert.ok(maxLat > ENTRADA_LAS_HERMOSAS.lat + 0.003, 'REGRESO no llega al retorno de la Calle 4 Sur');
});

test('toLatLngPath: camino feliz, borde vacio y entradas invalidas', () => {
  assert.deepEqual(toLatLngPath([[6.1, -75.5], [6.2, -75.6]]), [{ lat: 6.1, lng: -75.5 }, { lat: 6.2, lng: -75.6 }]);
  assert.deepEqual(toLatLngPath([]), []);
  assert.deepEqual(toLatLngPath(IDA)[0], pt(IDA[0]));
  assert.throws(() => toLatLngPath(null), TypeError);
  assert.throws(() => toLatLngPath('x'), TypeError);
  assert.throws(() => toLatLngPath([[6.1]]), TypeError);
  assert.throws(() => toLatLngPath([[6.1, '-75']]), TypeError);
  assert.throws(() => toLatLngPath([[NaN, -75]]), TypeError);
  assert.throws(() => toLatLngPath([{ lat: 6.1, lng: -75.5 }]), TypeError);
});

test('routeZone: entrada invalida usa el seed y sigue cubriendo los recorridos', () => {
  const zone = routeZone({ origin_lat: 'x', origin_lng: null, destination_lat: 999, destination_lng: 0, stops: 'nada' });
  assert.equal(zone.origin.lat, SEED_ROUTE.origin_lat);
  assert.equal(zone.destination.lat, SEED_ROUTE.destination_lat);
  assert.deepEqual(zone.stops, []);
  for (const p of ROUTE_POINTS) assert.ok(contains(zone.bounds, p));
});

// PRNG determinista (mulberry32) para que el Monte Carlo sea reproducible.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('Monte Carlo (semilla fija, N=1000) sobre la zona real: internos no cambian y externos quedan dentro', () => {
  const rand = mulberry32(20261109);
  const b = ZONES['zona por defecto (sin ruta)'].bounds;
  const N = 1000;
  const latSpan = b.north - b.south, lngSpan = b.east - b.west;
  let inside = 0, outside = 0;
  for (let i = 0; i < N; i++) {
    const p = { lat: b.south - latSpan + rand() * 3 * latSpan, lng: b.west - lngSpan + rand() * 3 * lngSpan };
    const c = clampToBounds(p, b);
    assert.ok(contains(b, c), `punto ${i} acotado fuera de los limites`);
    if (contains(b, p)) {
      inside++;
      assert.deepEqual(c, p, `punto interno ${i} cambio al acotarlo`);
    } else {
      outside++;
      assert.notDeepEqual(c, p);
      assert.deepEqual(clampToBounds(c, b), c);
    }
  }
  assert.equal(inside + outside, N);
  assert.ok(inside > 0 && outside > 0, `muestra sin variedad: ${inside} internos, ${outside} externos`);
  // Ningun punto de los recorridos cambia al acotarlo a la zona.
  for (const p of ROUTE_POINTS) assert.deepEqual(clampToBounds(p, b), p);
});
