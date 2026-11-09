// Ejecutar desde frontend: node --test src/lib/geoPermission.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geoPermissionMessage, TONES } from './geoPermission.js';

function assertValid(m) {
  assert.ok(m && typeof m === 'object');
  assert.ok(TONES.includes(m.tone));
  assert.equal(typeof m.title, 'string');
  assert.ok(m.title.trim().length > 0);
  assert.ok(Array.isArray(m.steps));
  for (const s of m.steps) assert.ok(typeof s === 'string' && s.length > 0);
}

test('camino feliz: permiso concedido en contexto seguro', () => {
  const m = geoPermissionMessage({ permission: 'granted', secureContext: true, hasGeolocation: true });
  assertValid(m);
  assert.equal(m.tone, 'ok');
  assert.deepEqual(m.steps, []);
});

test('permiso negado: pasos para PC y celular y recargar', () => {
  const m = geoPermissionMessage({ permission: 'denied', secureContext: true, hasGeolocation: true });
  assertValid(m);
  assert.equal(m.tone, 'danger');
  const text = m.steps.join(' ').toLowerCase();
  assert.match(text, /candado/);
  assert.match(text, /computador/);
  assert.match(text, /celular/);
  assert.match(text, /permitir/);
  assert.match(text, /recarga/);
});

test('contexto inseguro explica HTTPS o localhost y tiene prioridad', () => {
  for (const permission of ['granted', 'denied', 'unknown', undefined]) {
    const m = geoPermissionMessage({ permission, secureContext: false, hasGeolocation: true });
    assertValid(m);
    assert.equal(m.tone, 'danger');
    const text = `${m.title} ${m.steps.join(' ')}`;
    assert.match(text, /HTTPS/);
    assert.match(text, /localhost/);
  }
});

test('borde: sin geolocalizacion en contexto seguro', () => {
  const m = geoPermissionMessage({ permission: 'granted', secureContext: true, hasGeolocation: false });
  assertValid(m);
  assert.equal(m.title, 'Geolocalizacion no disponible');
});

test('borde: estados unknown y prompt piden permiso al iniciar', () => {
  const a = geoPermissionMessage({ permission: 'unknown', secureContext: true, hasGeolocation: true });
  const b = geoPermissionMessage({ permission: ' PROMPT ', secureContext: true, hasGeolocation: true });
  assertValid(a); assertValid(b);
  assert.deepEqual(a, b);
  assert.equal(a.tone, 'info');
  assert.match(a.steps.join(' '), /Iniciar recorrido/);
});

test('borde: error de lectura sugiere reintentar', () => {
  const m = geoPermissionMessage({ permission: 'error', secureContext: true, hasGeolocation: true });
  assertValid(m);
  assert.equal(m.tone, 'warn');
});

test('entrada invalida devuelve mensaje por defecto', () => {
  const def = geoPermissionMessage({ permission: 'unknown' });
  for (const input of [undefined, null, 42, 'denied', [], {}, { permission: 7 }, { permission: '__proto__' }, { permission: 'toString' }]) {
    const m = geoPermissionMessage(input);
    assertValid(m);
    assert.deepEqual(m, def);
  }
});

test('el resultado es una copia: mutarlo no afecta llamadas futuras', () => {
  const m = geoPermissionMessage({ permission: 'denied' });
  m.steps.push('x'); m.title = '';
  const n = geoPermissionMessage({ permission: 'denied' });
  assert.ok(n.title.length > 0);
  assert.ok(!n.steps.includes('x'));
});

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

test('Monte Carlo: 500 combinaciones aleatorias siempre dan mensaje valido', () => {
  const rand = mulberry32(20261109);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const permissions = ['granted', 'denied', 'unknown', 'prompt', 'unavailable', 'error', 'insecure',
    'GRANTED', ' denied ', '', 'basura', '???', '__proto__', 'constructor', 0, 1, -1, NaN, true, false,
    undefined, null, {}, [], () => 'granted', Symbol('x')];
  const flags = [true, false, undefined, null, 0, 1, 'true', 'false', {}, NaN];
  const N = 500;
  const tonesSeen = new Set();
  for (let i = 0; i < N; i++) {
    const input = { permission: pick(permissions), secureContext: pick(flags), hasGeolocation: pick(flags) };
    const m = geoPermissionMessage(input);
    assertValid(m);
    tonesSeen.add(m.tone);
    if (input.secureContext === false) assert.match(m.steps.join(' '), /HTTPS/);
    else if (input.hasGeolocation === false) assert.equal(m.title, 'Geolocalizacion no disponible');
  }
  assert.ok(tonesSeen.size >= 3);
});
