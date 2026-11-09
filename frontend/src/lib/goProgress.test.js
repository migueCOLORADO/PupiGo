// Ejecutar desde frontend: node --test src/lib/goProgress.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FILL_MS, DRAIN_RATIO, GO_RED, GO_ORANGE, GO_GREEN,
  clamp01, step, isSettled, ringVisible, colorAt, colorStage,
} from './goProgress.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} no es ~${b}`);

test('camino feliz: con hover el anillo se llena en FILL_MS', () => {
  near(step(0, true, FILL_MS / 2), 0.5);
  near(step(0.5, true, FILL_MS / 4), 0.75);
  assert.equal(step(0, true, FILL_MS), 1);
});

test('camino feliz: al salir baja desde el valor actual, sin reiniciar', () => {
  const drain = FILL_MS * DRAIN_RATIO;
  near(step(0.6, false, drain * 0.1), 0.5);
  near(step(0.3, false, 0), 0.3);
  assert.equal(step(1, false, drain), 0);
  assert.ok(drain < 1000, 'desde lleno vuelve a 0 en menos de 1 s');
});

test('borde: el progreso se queda en 1 con hover y en 0 sin hover', () => {
  assert.equal(step(1, true, 5000), 1);
  assert.equal(step(0, false, 5000), 0);
  assert.equal(step(0.99, true, 1e9), 1);
  assert.equal(step(0.01, false, 1e9), 0);
  assert.equal(isSettled(1, true), true);
  assert.equal(isSettled(0, false), true);
  assert.equal(isSettled(0.5, true), false);
  assert.equal(isSettled(0.5, false), false);
});

test('borde: progreso fuera de rango se acota', () => {
  assert.equal(clamp01(-3), 0);
  assert.equal(clamp01(7), 1);
  assert.equal(clamp01(Infinity), 1);
  assert.equal(step(-1, true, 0), 0);
  assert.equal(step(2, false, 0), 1);
});

test('colores: rojo en 0, naranja en 0.5, verde en 1', () => {
  assert.equal(colorAt(0), GO_RED);
  assert.equal(colorAt(0.5), GO_ORANGE);
  assert.equal(colorAt(1), GO_GREEN);
  assert.match(colorAt(0.25), /^#[0-9A-F]{6}$/);
  assert.equal(colorStage(0), 'rojo');
  assert.equal(colorStage(0.5), 'naranja');
  assert.equal(colorStage(1), 'verde');
});

test('ringVisible: visible con hover o con progreso pendiente', () => {
  assert.equal(ringVisible(0, true), true);
  assert.equal(ringVisible(0.2, false), true);
  assert.equal(ringVisible(0, false), false);
});

test('entrada invalida: tipos y rangos incorrectos lanzan error', () => {
  for (const bad of [NaN, '0.5', null, undefined, {}]) {
    assert.throws(() => step(bad, true, 16), TypeError);
    assert.throws(() => colorAt(bad), TypeError);
  }
  for (const bad of ['si', 1, null, undefined]) {
    assert.throws(() => step(0.5, bad, 16), TypeError);
  }
  for (const bad of [-1, NaN, Infinity, '16', null]) {
    assert.throws(() => step(0.5, true, bad), RangeError);
  }
  for (const bad of [0, -100, NaN, Infinity, '1600']) {
    assert.throws(() => step(0.5, true, 16, bad), RangeError);
    assert.throws(() => step(0.5, false, 16, 1600, bad), RangeError);
  }
});

// PRNG determinista (mulberry32) para que la simulacion sea reproducible.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

test('Monte Carlo: 600 secuencias aleatorias de entrar y salir del hover', () => {
  const rand = mulberry32(20261109);
  const SEQUENCES = 600;
  let frames = 0;
  for (let s = 0; s < SEQUENCES; s += 1) {
    let p = 0;
    let hovering = false;
    const toggles = 1 + Math.floor(rand() * 20);
    for (let t = 0; t < toggles; t += 1) {
      hovering = !hovering;
      const segmentMs = rand() * 2500;
      let elapsed = 0;
      while (elapsed < segmentMs) {
        const dt = Math.min(segmentMs - elapsed, 4 + rand() * 40);
        elapsed += dt;
        const next = step(p, hovering, dt);
        assert.ok(next >= 0 && next <= 1, `fuera de [0,1]: ${next} secuencia=${s}`);
        if (hovering) assert.ok(next >= p, `bajo con hover: ${p} -> ${next} secuencia=${s}`);
        else assert.ok(next <= p, `subio sin hover: ${p} -> ${next} secuencia=${s}`);
        p = next;
        frames += 1;
      }
      const [r, g] = hexToRgb(colorAt(p));
      if (p <= 0.05) assert.ok(r > 200 && g < 110, `no es rojo cerca de 0: ${colorAt(p)}`);
      if (p === 1) assert.equal(colorAt(p), GO_GREEN);
    }
  }
  assert.ok(frames > SEQUENCES);
  const [r0, g0] = hexToRgb(colorAt(0));
  assert.ok(r0 > g0 * 2);
  assert.equal(colorAt(1), GO_GREEN);
});
