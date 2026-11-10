// Ejecutar desde frontend/: node --test src/lib/mapMarkers.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLORS, DEFAULT_STATION, LABELS, LEGEND_ORDER, busMarker, directionStart, isValidPoint, mapIndicators,
  markerIconSvg, markerIconUrl, selectedDirection,
} from './mapMarkers.js';
import { IDA, REGRESO } from './routePaths.js';
import { routeZone } from '../components/map/routeZone.js';

const R = 6371008.8;
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const pt = ([lat, lng]) => ({ lat, lng });
const MAX_M = 30;
const zone = routeZone(null);
const marker = (ind, key) => ind.markers.find((m) => m.key === key);

test('Paradero La Aguacatala: inicio de IDA y fin de REGRESO (<= 30 m)', () => {
  const stop = marker(mapIndicators(), 'stop');
  assert.ok(haversine(stop, pt(IDA[0])) <= MAX_M, `IDA[0] a ${haversine(stop, pt(IDA[0])).toFixed(2)} m`);
  assert.ok(haversine(stop, pt(REGRESO.at(-1))) <= MAX_M, `fin de REGRESO a ${haversine(stop, pt(REGRESO.at(-1))).toFixed(2)} m`);
  assert.equal(stop.label, 'Paradero La Aguacatala');
});

test('Entrada Las Hermosas: fin de IDA e inicio de REGRESO (<= 30 m)', () => {
  const eafit = marker(mapIndicators(), 'eafit');
  assert.ok(haversine(eafit, pt(IDA.at(-1))) <= MAX_M);
  assert.ok(haversine(eafit, pt(REGRESO[0])) <= MAX_M);
  assert.equal(eafit.label, 'Entrada Las Hermosas');
});

test('Estacion Aguacatala: en la estacion de la ruta o la del seed', () => {
  assert.deepEqual(
    { lat: marker(mapIndicators(), 'metro').lat, lng: marker(mapIndicators(), 'metro').lng },
    { ...DEFAULT_STATION },
  );
  const m = marker(mapIndicators({ station: { lat: 6.194, lng: -75.582 } }), 'metro');
  assert.equal(m.lat, 6.194);
  assert.equal(m.lng, -75.582);
  assert.equal(m.label, 'Estación Aguacatala');
});

test('bus en espera sin GPS: al inicio del trazado de la direccion', () => {
  for (const [direction, path] of [['ida', IDA], ['vuelta', REGRESO]]) {
    const trip = { status: 'waiting', direction, last_position: null };
    const bus = marker(mapIndicators({ trip, bounds: zone.bounds }), 'bus');
    assert.ok(haversine(bus, pt(path[0])) <= MAX_M, direction);
    assert.equal(haversine(bus, directionStart(direction)), 0);
    assert.equal(bus.gps, false);
    assert.equal(bus.color, COLORS.waiting);
    // En espera queda sobre el Paradero (ida) o la Entrada (vuelta): se dibuja encima sin taparlo.
    assert.equal(bus.stackedOn, direction === 'vuelta' ? 'eafit' : 'stop');
  }
});

test('bus con GPS: donde reporte; fuera de la zona se recorta al borde', () => {
  const pos = { lat: 6.1965, lng: -75.5806 };
  const bus = busMarker({ trip: { status: 'in_progress', direction: 'ida', last_position: pos }, bounds: zone.bounds });
  assert.equal(bus.lat, pos.lat);
  assert.equal(bus.lng, pos.lng);
  assert.equal(bus.color, COLORS.live);
  assert.equal(bus.outside, false);
  assert.equal(marker(mapIndicators({ trip: { status: 'in_progress', last_position: pos } }), 'bus').stackedOn, null);
  const far = busMarker({ trip: { status: 'in_progress', direction: 'ida', last_position: { lat: 7, lng: -75.58 } }, bounds: zone.bounds });
  assert.equal(far.outside, true);
  assert.equal(far.lat, zone.bounds.north);
  const stale = busMarker({ trip: { status: 'in_progress', last_position: pos }, stale: true });
  assert.equal(stale.color, COLORS.stale);
  // Posicion en texto (como la serializa DRF) tambien sirve.
  const str = busMarker({ trip: { status: 'in_progress', last_position: { lat: '6.1965', lng: '-75.5806' } } });
  assert.equal(str.lat, 6.1965);
});

test('direccion: el recorrido manda; sin recorrido se usa la elegida; valores raros son ida', () => {
  assert.equal(selectedDirection({ direction: 'vuelta' }, 'ida'), 'vuelta');
  assert.equal(selectedDirection(null, 'vuelta'), 'vuelta');
  assert.equal(selectedDirection(null, 'regreso'), 'ida');
  assert.equal(selectedDirection(undefined, undefined), 'ida');
  const ind = mapIndicators({ direction: 'vuelta' });
  assert.deepEqual(ind.lines.map((l) => [l.key, l.selected]), [['ida', false], ['regreso', true]]);
  assert.deepEqual(ind.legend.filter((e) => e.type === 'line').map((e) => [e.label, e.dashed]),
    [['Metro → EAFIT', true], ['EAFIT → Metro', false]]);
});

test('borde: sin recorrido no hay bus ni entrada "Pupi Bus"', () => {
  const ind = mapIndicators({ trip: null });
  assert.equal(marker(ind, 'bus'), undefined);
  assert.deepEqual(ind.legend.map((e) => e.key), ['metro', 'stop', 'eafit', 'ida', 'regreso']);
  assert.ok(!ind.legend.some((e) => e.label === 'Ruta del recorrido'));
});

test('entrada invalida: no lanza y usa valores por defecto', () => {
  assert.equal(isValidPoint({ lat: NaN, lng: 1 }), false);
  assert.equal(isValidPoint({ lat: null, lng: null }), false);
  assert.equal(isValidPoint({ lat: 91, lng: 0 }), false);
  assert.equal(isValidPoint('6,-75'), false);
  const ind = mapIndicators({ station: { lat: 'x', lng: 2 }, bounds: { north: 'a' } });
  assert.equal(marker(ind, 'metro').lat, DEFAULT_STATION.lat);
  // GPS invalido con recorrido: bus al inicio de la direccion.
  const bus = busMarker({ trip: { status: 'in_progress', direction: 'vuelta', last_position: { lat: 'nope', lng: 0 } } });
  assert.equal(haversine(bus, pt(REGRESO[0])), 0);
  // Limites invalidos: no recorta ni lanza.
  const b2 = busMarker({ trip: { status: 'in_progress', last_position: { lat: 7, lng: -75 } }, bounds: { north: 1 } });
  assert.equal(b2.lat, 7);
  assert.equal(mapIndicators(undefined).direction, 'ida');
  assert.throws(() => markerIconSvg('otro', '#000'), TypeError);
});

test('iconos de marcadores con el color de la leyenda', () => {
  for (const m of mapIndicators({ trip: { status: 'waiting', direction: 'ida' } }).markers) {
    assert.ok(markerIconSvg(m.key, m.color).includes(`fill="${m.color}"`), m.key);
    assert.ok(markerIconUrl(m.key, m.color).startsWith('data:image/svg+xml'));
  }
});

// Generador pseudoaleatorio con semilla fija.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('Monte Carlo (N=2000, semilla 20): la leyenda coincide con los marcadores dibujados', () => {
  const rnd = mulberry32(20);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const N = 2000;
  const seen = new Set();
  for (let i = 0; i < N; i++) {
    const kind = pick(['none', 'waiting', 'in_progress']);
    const direction = pick(['ida', 'vuelta']);
    const gps = rnd() < 0.5;
    const stale = kind === 'in_progress' && rnd() < 0.3;
    const pos = gps ? { lat: 6.18 + rnd() * 0.03, lng: -75.6 + rnd() * 0.03 } : null;
    const trip = kind === 'none' ? null : { status: kind, direction, last_position: pos };
    seen.add(`${kind}|${direction}|${gps}`);
    const ind = mapIndicators({ trip, direction, station: zone.origin, bounds: zone.bounds, stale });

    const markerKeys = ind.markers.map((m) => m.key).sort();
    const legendMarkers = ind.legend.filter((e) => e.type === 'marker');
    assert.deepEqual(legendMarkers.map((e) => e.key).sort(), markerKeys, `iteracion ${i}`);
    for (const e of legendMarkers) {
      const m = marker(ind, e.key);
      assert.equal(e.color, m.color);
      assert.equal(e.label, LABELS[e.key]);
    }
    for (const l of ind.lines) {
      const e = ind.legend.find((x) => x.key === l.key);
      assert.equal(e.color, l.color);
      assert.equal(e.dashed, !l.selected);
    }
    assert.deepEqual(ind.legend.map((e) => e.key), LEGEND_ORDER.filter((k) => k !== 'bus' || markerKeys.includes('bus')));
    assert.equal(ind.lines.filter((l) => l.selected).length, 1);
    assert.equal(ind.lines.find((l) => l.selected).key, ind.direction === 'vuelta' ? 'regreso' : 'ida');

    const bus = marker(ind, 'bus');
    assert.equal(Boolean(bus), kind !== 'none');
    if (bus?.stackedOn) assert.ok(markerKeys.includes(bus.stackedOn));
    if (bus && !gps) assert.ok(haversine(bus, pt((direction === 'vuelta' ? REGRESO : IDA)[0])) <= MAX_M);
    if (bus && gps) {
      assert.ok(bus.lat <= zone.bounds.north && bus.lat >= zone.bounds.south);
      assert.ok(bus.lng <= zone.bounds.east && bus.lng >= zone.bounds.west);
    }
  }
  assert.equal(seen.size, 12, 'se cubren todos los estados');
});
