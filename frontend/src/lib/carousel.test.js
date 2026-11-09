// Ejecutar desde frontend: node --test src/lib/carousel.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidLength, wrapIndex, clampIndex, nextIndex, prevIndex, reachableCount, indexFromScroll,
} from './carousel.js';

test('camino feliz: siguiente y anterior avanzan de a uno', () => {
  assert.equal(nextIndex(0, 4), 1);
  assert.equal(nextIndex(2, 4), 3);
  assert.equal(prevIndex(3, 4), 2);
  assert.equal(prevIndex(1, 4), 0);
});

test('borde: con loop el carrusel da la vuelta en ambos extremos', () => {
  assert.equal(nextIndex(3, 4), 0);
  assert.equal(prevIndex(0, 4), 3);
  assert.equal(nextIndex(0, 1), 0);
  assert.equal(prevIndex(0, 1), 0);
});

test('borde: sin loop el indice se queda en el extremo', () => {
  assert.equal(nextIndex(3, 4, false), 3);
  assert.equal(prevIndex(0, 4, false), 0);
});

test('wrap y clamp normalizan indices fuera de rango y decimales', () => {
  assert.equal(wrapIndex(-1, 3), 2);
  assert.equal(wrapIndex(7, 3), 1);
  assert.equal(wrapIndex(-7, 3), 2);
  assert.equal(clampIndex(-5, 3), 0);
  assert.equal(clampIndex(99, 3), 2);
  assert.equal(clampIndex(1.9, 3), 1);
});

test('reachableCount e indexFromScroll calculan posiciones del scroll', () => {
  assert.equal(reachableCount(0, 300, 4), 1);
  assert.equal(reachableCount(600, 300, 4), 3);
  assert.equal(reachableCount(5000, 300, 4), 4);
  assert.equal(indexFromScroll(0, 300, 4), 0);
  assert.equal(indexFromScroll(320, 300, 4), 1);
  assert.equal(indexFromScroll(99999, 300, 4), 3);
  assert.equal(indexFromScroll(-50, 300, 4), 0);
});

test('entrada invalida: length no entero positivo lanza RangeError', () => {
  for (const bad of [0, -1, 2.5, NaN, Infinity, '3', null, undefined]) {
    assert.equal(isValidLength(bad), false);
    assert.throws(() => wrapIndex(0, bad), RangeError);
    assert.throws(() => clampIndex(0, bad), RangeError);
    assert.throws(() => nextIndex(0, bad), RangeError);
    assert.throws(() => reachableCount(100, 10, bad), RangeError);
  }
});

test('entrada invalida: index no numerico lanza TypeError', () => {
  for (const bad of [NaN, Infinity, '1', null, undefined, {}]) {
    assert.throws(() => nextIndex(bad, 3), TypeError);
    assert.throws(() => prevIndex(bad, 3), TypeError);
    assert.throws(() => wrapIndex(bad, 3), TypeError);
  }
});

test('entrada invalida: scroll o paso no validos caen al inicio sin romper', () => {
  assert.equal(indexFromScroll(NaN, 300, 3), 0);
  assert.equal(indexFromScroll(100, 0, 3), 0);
  assert.equal(indexFromScroll(100, -10, 3), 0);
  assert.equal(reachableCount(NaN, 300, 3), 1);
  assert.equal(reachableCount(600, 0, 3), 1);
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

test('Monte Carlo: 500 secuencias aleatorias de siguiente/anterior nunca salen de rango', () => {
  const rand = mulberry32(20260216);
  const SEQUENCES = 500;
  let steps = 0;
  for (let s = 0; s < SEQUENCES; s += 1) {
    const length = 1 + Math.floor(rand() * 12);
    const loop = rand() < 0.5;
    let index = Math.floor(rand() * length);
    const moves = 1 + Math.floor(rand() * 60);
    let expected = index;
    for (let m = 0; m < moves; m += 1) {
      const forward = rand() < 0.5;
      index = forward ? nextIndex(index, length, loop) : prevIndex(index, length, loop);
      // modelo de referencia independiente
      if (loop) expected = (expected + (forward ? 1 : -1) + length) % length;
      else expected = Math.min(length - 1, Math.max(0, expected + (forward ? 1 : -1)));
      assert.ok(Number.isInteger(index) && index >= 0 && index < length,
        `fuera de rango: index=${index} length=${length} secuencia=${s}`);
      assert.equal(index, expected);
      steps += 1;
    }
  }
  assert.ok(steps >= SEQUENCES);
});
