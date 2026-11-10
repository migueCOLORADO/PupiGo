// Ejecutar desde frontend: node --test src/lib/contrast.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AA_NORMAL, AA_LARGE, linearize, relativeLuminance, contrastFromLuminance, contrastRatio,
  hexToRgb, worstContrast, passesAA,
} from './contrast.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} no es ~${b}`);

test('camino feliz: blanco contra negro es 21:1 y valores conocidos', () => {
  near(contrastRatio([255, 255, 255], [0, 0, 0]), 21);
  near(relativeLuminance([255, 255, 255]), 1);
  near(relativeLuminance([0, 0, 0]), 0);
  // #767676 sobre blanco es el gris mas claro que pasa AA (~4.54)
  const r = contrastRatio(hexToRgb('#767676'), [255, 255, 255]);
  assert.ok(r > 4.5 && r < 4.6, `#767676: ${r}`);
  assert.equal(passesAA(r), true);
  assert.equal(passesAA(3.2, true), true);
  assert.equal(passesAA(3.2), false);
});

test('borde: colores iguales dan 1, orden indiferente y umbral del tramo lineal', () => {
  near(contrastRatio([12, 80, 200], [12, 80, 200]), 1);
  near(contrastRatio([10, 20, 30], [200, 210, 220]), contrastRatio([200, 210, 220], [10, 20, 30]));
  near(linearize(0), 0);
  near(linearize(255), 1);
  near(linearize(10), 10 / 255 / 12.92);
  assert.equal(passesAA(AA_NORMAL), true);
  assert.equal(passesAA(AA_LARGE, true), true);
  const w = worstContrast([255, 255, 255], [0, 0, 0, 255, 128, 128, 128, 255, 20, 20, 20, 255]);
  assert.deepEqual(w.pixel, [128, 128, 128]);
});

test('entrada invalida: canales, listas y ratios fuera de rango lanzan error', () => {
  for (const bad of [-1, 256, NaN, Infinity, '12', null]) {
    assert.throws(() => linearize(bad), RangeError);
  }
  for (const bad of [null, 'rgb', [1, 2], 7]) {
    assert.throws(() => relativeLuminance(bad), TypeError);
  }
  for (const bad of [-0.1, 1.1, NaN, '0.5']) {
    assert.throws(() => contrastFromLuminance(bad, 0.5), RangeError);
  }
  for (const bad of ['#12345', 'FFFFFF', '#GGGGGG', 12]) {
    assert.throws(() => hexToRgb(bad), TypeError);
  }
  assert.throws(() => worstContrast([255, 255, 255], []), RangeError);
  assert.throws(() => worstContrast([255, 255, 255], [1, 2, 3]), RangeError);
  assert.throws(() => passesAA(0.5), RangeError);
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

// Formula WCAG 2.x escrita de nuevo, sin reutilizar nada del modulo.
function referenceRatio(a, b) {
  const lum = ([r, g, bl]) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const la = lum(a);
  const lb = lum(b);
  return la > lb ? (la + 0.05) / (lb + 0.05) : (lb + 0.05) / (la + 0.05);
}

test('Monte Carlo: 2000 pares de colores aleatorios coinciden con la formula WCAG de referencia', () => {
  const rand = mulberry32(20261109);
  const color = () => [0, 0, 0].map(() => Math.floor(rand() * 256));
  for (let i = 0; i < 2000; i += 1) {
    const a = color();
    const b = color();
    const got = contrastRatio(a, b);
    near(got, referenceRatio(a, b), 1e-9);
    assert.ok(got >= 1 && got <= 21, `fuera de [1, 21]: ${got}`);
    const lum = relativeLuminance(a);
    assert.ok(lum >= 0 && lum <= 1);
  }
});

test('Monte Carlo: el peor pixel de 500 fondos aleatorios es el minimo real', () => {
  const rand = mulberry32(7);
  for (let s = 0; s < 500; s += 1) {
    const n = 1 + Math.floor(rand() * 30);
    const px = [];
    for (let i = 0; i < n; i += 1) px.push(Math.floor(rand() * 256), Math.floor(rand() * 256), Math.floor(rand() * 256), 255);
    const text = [Math.floor(rand() * 256), Math.floor(rand() * 256), Math.floor(rand() * 256)];
    let expected = Infinity;
    for (let i = 0; i < px.length; i += 4) expected = Math.min(expected, referenceRatio(text, px.slice(i, i + 3)));
    near(worstContrast(text, px).ratio, expected, 1e-9);
  }
});
