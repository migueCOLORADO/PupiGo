import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COLLAPSED, COLLAPSED_PX, DEFAULT_VIEWPORT, EXPANDED, FLING_VELOCITY, MIN_MAP_RATIO, SHEET_STATES, TOP_CHROME_PX,
  dragHeight, mapVisiblePx, normalizeState, resolveSheet, sheetHeights, toggleSheet,
} from './sheet.js';

describe('sheetHeights', () => {
  it('camino feliz en 390x844: contraida usa COLLAPSED_PX y expandida es mayor', () => {
    const h = sheetHeights(844);
    assert.equal(h.collapsed, COLLAPSED_PX);
    assert.ok(h.expanded > h.collapsed);
    assert.ok(mapVisiblePx(h.collapsed, 844) >= 0.6 * 844);
  });
  it('borde: viewport bajo (400 px, teclado abierto) reduce la contraida para respetar el 60 % de mapa', () => {
    const h = sheetHeights(400);
    assert.ok(h.collapsed < COLLAPSED_PX);
    assert.ok(mapVisiblePx(h.collapsed, 400) >= MIN_MAP_RATIO * 400);
  });
  it('borde: la expandida nunca tapa la barra superior', () => {
    const h = sheetHeights(300);
    assert.ok(h.expanded <= 300 - TOP_CHROME_PX);
  });
  it('entrada invalida: NaN, negativo o texto usan el viewport por defecto', () => {
    for (const bad of [NaN, -10, 0, Infinity, '800', undefined, null]) {
      assert.deepEqual(sheetHeights(bad), sheetHeights(DEFAULT_VIEWPORT));
    }
  });
});

describe('resolveSheet', () => {
  const vh = 844;
  it('contraer con el dedo: expandida + arrastre lento hacia abajo => contraida', () => {
    const r = resolveSheet({ state: EXPANDED, delta: 200, velocity: 0.1, viewportHeight: vh });
    assert.equal(r.state, COLLAPSED);
    assert.equal(r.height, r.collapsed);
  });
  it('expandir con el dedo: contraida + arrastre hacia arriba => expandida', () => {
    const r = resolveSheet({ state: COLLAPSED, delta: -200, velocity: -0.1, viewportHeight: vh });
    assert.equal(r.state, EXPANDED);
    assert.equal(r.height, r.expanded);
  });
  it('gesto rapido corto decide por la direccion de la velocidad', () => {
    assert.equal(resolveSheet({ state: COLLAPSED, delta: -5, velocity: -FLING_VELOCITY, viewportHeight: vh }).state, EXPANDED);
    assert.equal(resolveSheet({ state: EXPANDED, delta: 5, velocity: FLING_VELOCITY, viewportHeight: vh }).state, COLLAPSED);
  });
  it('borde: arrastre minimo o en la direccion sin efecto conserva el estado', () => {
    assert.equal(resolveSheet({ state: COLLAPSED, delta: -10, velocity: 0, viewportHeight: vh }).state, COLLAPSED);
    assert.equal(resolveSheet({ state: COLLAPSED, delta: 400, velocity: 0, viewportHeight: vh }).state, COLLAPSED);
    assert.equal(resolveSheet({ state: EXPANDED, delta: -400, velocity: 0, viewportHeight: vh }).state, EXPANDED);
  });
  it('entrada invalida: estado desconocido, delta y velocidad no numericos', () => {
    assert.equal(resolveSheet({ state: 'abierta', delta: NaN, velocity: Infinity, viewportHeight: vh }).state, COLLAPSED);
    assert.equal(resolveSheet({ state: EXPANDED, delta: 'x', velocity: NaN, viewportHeight: NaN }).state, EXPANDED);
    assert.equal(resolveSheet().state, COLLAPSED);
  });
});

describe('dragHeight y toggleSheet', () => {
  it('el alto durante el arrastre queda acotado', () => {
    const h = sheetHeights(844);
    assert.equal(dragHeight(COLLAPSED, 500, 844), h.collapsed);
    assert.equal(dragHeight(COLLAPSED, -5000, 844), h.expanded);
    assert.equal(dragHeight(COLLAPSED, -40, 844), h.collapsed + 40);
    assert.equal(dragHeight(EXPANDED, NaN, 844), h.expanded);
  });
  it('el boton alterna y normaliza estados invalidos', () => {
    assert.equal(toggleSheet(COLLAPSED), EXPANDED);
    assert.equal(toggleSheet(EXPANDED), COLLAPSED);
    assert.equal(toggleSheet('otro'), EXPANDED);
    assert.equal(normalizeState(42), COLLAPSED);
  });
});

// PRNG con semilla fija para que el Monte Carlo sea reproducible.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Monte Carlo (mulberry32, semilla 18)', () => {
  it('500 arrastres aleatorios terminan en estado valido y la contraida deja >= 60 % de mapa', () => {
    const rnd = mulberry32(18);
    const specials = [NaN, Infinity, -Infinity, undefined];
    const pick = (lo, hi) => (rnd() < 0.08 ? specials[Math.floor(rnd() * specials.length)] : lo + rnd() * (hi - lo));
    let state = COLLAPSED;
    const seen = new Set();
    for (let i = 0; i < 500; i++) {
      const vh = rnd() < 0.05 ? NaN : 480 + Math.floor(rnd() * 920); // 480..1400 px
      const r = resolveSheet({ state, delta: pick(-1500, 1500), velocity: pick(-4, 4), viewportHeight: vh });
      assert.ok(SHEET_STATES.includes(r.state), `estado invalido en iteracion ${i}`);
      assert.ok(Number.isFinite(r.height) && r.height >= 0);
      assert.ok(r.collapsed <= r.expanded);
      assert.ok(mapVisiblePx(r.collapsed, r.viewportHeight) >= MIN_MAP_RATIO * r.viewportHeight,
        `mapa < 60 % con vh=${r.viewportHeight}`);
      const d = dragHeight(state, pick(-1500, 1500), vh);
      assert.ok(d >= r.collapsed && d <= r.expanded);
      seen.add(r.state);
      state = r.state;
    }
    assert.equal(seen.size, 2, 'el muestreo debe cubrir ambos estados');
  });
});
