// Ejecutar desde frontend/: node --test src/lib/bounds.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundsFromPoints, clampToBounds, contains } from './bounds.js';

// Coordenadas de la ruta sembrada (backend/tracking/management/commands/seed.py).
const AGUACATALA = { lat: 6.19385, lng: -75.58180 };
const HERMOSAS = { lat: 6.19960, lng: -75.57850 };
const MARGIN = 0.004;
const EPS = 1e-12;

test('boundsFromPoints: camino feliz con la ruta del seed y margen', () => {
  const b = boundsFromPoints([AGUACATALA, HERMOSAS], MARGIN);
  assert.ok(Math.abs(b.north - (6.19960 + MARGIN)) < EPS);
  assert.ok(Math.abs(b.south - (6.19385 - MARGIN)) < EPS);
  assert.ok(Math.abs(b.east - (-75.57850 + MARGIN)) < EPS);
  assert.ok(Math.abs(b.west - (-75.58180 - MARGIN)) < EPS);
  assert.ok(contains(b, AGUACATALA));
  assert.ok(contains(b, HERMOSAS));
});

test('boundsFromPoints: borde con un solo punto y margen 0 da un rectangulo degenerado', () => {
  const b = boundsFromPoints([AGUACATALA]);
  assert.deepEqual(b, { north: 6.19385, south: 6.19385, east: -75.58180, west: -75.58180 });
  assert.ok(contains(b, AGUACATALA));
});

test('boundsFromPoints: borde, el margen se recorta al rango valido', () => {
  const b = boundsFromPoints([{ lat: 89.9, lng: 179.9 }, { lat: -89.9, lng: -179.9 }], 1);
  assert.deepEqual(b, { north: 90, south: -90, east: 180, west: -180 });
});

test('boundsFromPoints: entradas invalidas', () => {
  assert.throws(() => boundsFromPoints([], 0), TypeError);
  assert.throws(() => boundsFromPoints(null, 0), TypeError);
  assert.throws(() => boundsFromPoints('x', 0), TypeError);
  assert.throws(() => boundsFromPoints([{ lat: 'a', lng: 1 }]), TypeError);
  assert.throws(() => boundsFromPoints([{ lat: NaN, lng: 1 }]), TypeError);
  assert.throws(() => boundsFromPoints([null]), TypeError);
  assert.throws(() => boundsFromPoints([{ lat: 91, lng: 0 }]), RangeError);
  assert.throws(() => boundsFromPoints([{ lat: 0, lng: -181 }]), RangeError);
  assert.throws(() => boundsFromPoints([AGUACATALA], -1), RangeError);
  assert.throws(() => boundsFromPoints([AGUACATALA], Infinity), RangeError);
});

test('contains: bordes incluidos y puntos externos', () => {
  const b = { north: 1, south: -1, east: 2, west: -2 };
  assert.equal(contains(b, { lat: 1, lng: 2 }), true);
  assert.equal(contains(b, { lat: -1, lng: -2 }), true);
  assert.equal(contains(b, { lat: 0, lng: 0 }), true);
  assert.equal(contains(b, { lat: 1.0001, lng: 0 }), false);
  assert.equal(contains(b, { lat: 0, lng: -2.0001 }), false);
});

test('contains y clampToBounds: entradas invalidas', () => {
  const b = { north: 1, south: -1, east: 2, west: -2 };
  assert.throws(() => contains(null, { lat: 0, lng: 0 }), TypeError);
  assert.throws(() => contains({ north: 1, south: 2, east: 1, west: 0 }, { lat: 0, lng: 0 }), RangeError);
  assert.throws(() => contains({ north: 1, south: 0, east: 0, west: 1 }, { lat: 0, lng: 0 }), RangeError);
  assert.throws(() => contains({ north: 1, south: 0, east: 1 }, { lat: 0, lng: 0 }), TypeError);
  assert.throws(() => contains(b, undefined), TypeError);
  assert.throws(() => clampToBounds({ lat: 0 }, b), TypeError);
  assert.throws(() => clampToBounds({ lat: 0, lng: 0 }, {}), TypeError);
});

test('clampToBounds: lleva el punto externo al borde mas cercano y conserva otros campos', () => {
  const b = { north: 1, south: -1, east: 2, west: -2 };
  assert.deepEqual(clampToBounds({ lat: 5, lng: -9, id: 7 }, b), { lat: 1, lng: -2, id: 7 });
  assert.deepEqual(clampToBounds({ lat: 0.5, lng: 3 }, b), { lat: 0.5, lng: 2 });
  assert.deepEqual(clampToBounds({ lat: 0.5, lng: 1.5 }, b), { lat: 0.5, lng: 1.5 });
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

test('Monte Carlo (semilla fija, N=500): internos no cambian y externos quedan dentro', () => {
  const rand = mulberry32(20260248);
  const b = boundsFromPoints([AGUACATALA, HERMOSAS], MARGIN);
  const N = 500;
  // Se muestrea en una caja 3 veces mas grande que la zona para obtener internos y externos.
  const latSpan = b.north - b.south, lngSpan = b.east - b.west;
  let inside = 0, outside = 0;
  for (let i = 0; i < N; i++) {
    const p = {
      lat: b.south - latSpan + rand() * 3 * latSpan,
      lng: b.west - lngSpan + rand() * 3 * lngSpan,
    };
    const c = clampToBounds(p, b);
    assert.ok(contains(b, c), `punto ${i} acotado fuera de los limites`);
    if (contains(b, p)) {
      inside++;
      assert.deepEqual(c, p, `punto interno ${i} cambio al acotarlo`);
    } else {
      outside++;
      assert.notDeepEqual(c, p);
      // El punto acotado es idempotente.
      assert.deepEqual(clampToBounds(c, b), c);
    }
  }
  assert.equal(inside + outside, N);
  assert.ok(inside > 0 && outside > 0, `muestra sin variedad: ${inside} internos, ${outside} externos`);
});
