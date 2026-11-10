// Ejecutar desde frontend: node --test src/lib/carousel.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidLength, wrapIndex, clampIndex, nextIndex, prevIndex, reachableCount, indexFromScroll,
  centerScrollLeft, nearestIndex, edgeZone, aspectDiff, fitScale, chooseFit, detailLayout,
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

test('camino feliz: centerScrollLeft centra la diapositiva activa', () => {
  // viewport 1000, diapositiva de 850 en x=1000: queda centrada con 75 px a cada lado
  assert.equal(centerScrollLeft(1000, 850, 1000, 5000), 925);
  assert.equal(centerScrollLeft(75, 850, 1000, 5000), 0);
});

test('borde: centerScrollLeft se acota a [0, maxScroll]', () => {
  assert.equal(centerScrollLeft(0, 850, 1000, 5000), 0);
  assert.equal(centerScrollLeft(9000, 850, 1000, 2000), 2000);
  assert.equal(centerScrollLeft(500, 850, 1000, -10), 0);
});

test('entrada invalida: centerScrollLeft con NaN no rompe y queda en rango', () => {
  assert.equal(centerScrollLeft(NaN, undefined, '1000', null), 0);
});

test('nearestIndex elige el centro mas cercano', () => {
  const centers = [500, 1400, 2300, 3200];
  assert.equal(nearestIndex(500, centers), 0);
  assert.equal(nearestIndex(1300, centers), 1);
  assert.equal(nearestIndex(99999, centers), 3);
  assert.equal(nearestIndex(-50, centers), 0);
  assert.equal(nearestIndex(NaN, centers), 0);
  assert.throws(() => nearestIndex(10, []), RangeError);
  assert.throws(() => nearestIndex(10, null), RangeError);
});

test('edgeZone detecta la franja del 10 % de cada borde', () => {
  assert.equal(edgeZone(0, 1440), 'left');
  assert.equal(edgeZone(144, 1440), 'left');
  assert.equal(edgeZone(145, 1440), null);
  assert.equal(edgeZone(720, 1440), null);
  assert.equal(edgeZone(1296, 1440), 'right');
  assert.equal(edgeZone(1440, 1440), 'right');
  assert.equal(edgeZone(1295, 1440), null);
});

test('entrada invalida: edgeZone devuelve null', () => {
  for (const args of [[NaN, 100], [10, 0], [10, -5], ['10', 100], [-1, 100], [101, 100], [10, 100, 0], [10, 100, 0.6]]) {
    assert.equal(edgeZone(...args), null, `args=${JSON.stringify(args)}`);
  }
});

test('imagenes: camino feliz de cover y contain en la tarjeta', () => {
  // foto grande y de proporcion parecida: cover sin ampliar
  assert.equal(chooseFit({ w: 1600, h: 900 }, { w: 1200, h: 650 }), 'cover');
  // menor resolucion que el hueco: contain con fondo desenfocado
  assert.equal(chooseFit({ w: 626, h: 626 }, { w: 1224, h: 648 }), 'contain');
  // proporcion muy distinta aunque sobre resolucion: contain
  assert.equal(chooseFit({ w: 1200, h: 535 }, { w: 328, h: 608 }), 'contain');
  assert.equal(detailLayout({ w: 1200, h: 535 }), 'top');
  assert.equal(detailLayout({ w: 626, h: 626 }), 'side');
  assert.equal(fitScale({ w: 100, h: 50 }, { w: 200, h: 200 }, 'cover'), 4);
  assert.equal(fitScale({ w: 100, h: 50 }, { w: 200, h: 200 }, 'contain'), 2);
});

test('imagenes: bordes exactos de proporcion y escala', () => {
  assert.equal(aspectDiff({ w: 3, h: 2 }, { w: 1, h: 1 }), 1.5);
  assert.equal(chooseFit({ w: 1500, h: 1000 }, { w: 1000, h: 1000 }), 'cover');
  assert.equal(chooseFit({ w: 1000, h: 1000 }, { w: 1000, h: 1000 }), 'cover');
  assert.equal(chooseFit({ w: 999, h: 999 }, { w: 1000, h: 1000 }), 'contain');
  assert.equal(chooseFit({ w: 626, h: 626 }, { w: 528, h: 792 }, { maxUpscale: 1.5, maxAspectDiff: Infinity }), 'cover');
  assert.equal(chooseFit({ w: 300, h: 300 }, { w: 528, h: 792 }, { maxUpscale: 1.5, maxAspectDiff: Infinity }), 'contain');
  assert.equal(detailLayout({ w: 130, h: 100 }), 'top');
  assert.equal(detailLayout({ w: 129, h: 100 }), 'side');
});

test('imagenes: entradas invalidas lanzan error', () => {
  for (const bad of [null, {}, { w: 0, h: 1 }, { w: 1, h: -1 }, { w: NaN, h: 1 }, { w: '1', h: 1 }]) {
    assert.throws(() => chooseFit(bad, { w: 1, h: 1 }), RangeError);
    assert.throws(() => chooseFit({ w: 1, h: 1 }, bad), RangeError);
    assert.throws(() => detailLayout(bad), RangeError);
  }
  assert.throws(() => fitScale({ w: 1, h: 1 }, { w: 1, h: 1 }, 'fill'), TypeError);
  assert.throws(() => chooseFit({ w: 1, h: 1 }, { w: 1, h: 1 }, { maxUpscale: 0 }), RangeError);
  assert.throws(() => chooseFit({ w: 1, h: 1 }, { w: 1, h: 1 }, { maxAspectDiff: 0.5 }), RangeError);
});

test('imagenes Monte Carlo: cover nunca amplia mas de lo permitido', () => {
  let a = 99;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 1000; i += 1) {
    const nat = { w: 50 + rand() * 3000, h: 50 + rand() * 3000 };
    const box = { w: 50 + rand() * 2000, h: 50 + rand() * 2000 };
    if (chooseFit(nat, box) === 'cover') {
      assert.ok(fitScale(nat, box, 'cover') <= 1 + 1e-12);
      assert.ok(aspectDiff(nat, box) <= 1.5 + 1e-12);
    }
  }
});
