// UH16 #219: logica pura del anillo de carga del boton GO (sin React ni DOM).
// El progreso va de 0 a 1: sube mientras el cursor esta encima y baja de forma continua al salir.

export const FILL_MS = 1600;
// La reversa es mas rapida que el llenado: desde lleno (1) tarda menos de 1 s en volver a 0.
export const DRAIN_RATIO = 0.6;

export const GO_RED = '#EF4444';
export const GO_ORANGE = '#F59E0B';
export const GO_GREEN = '#22C55E';

function assertProgress(progress) {
  if (typeof progress !== 'number' || Number.isNaN(progress)) {
    throw new TypeError(`progress debe ser un numero, recibido: ${progress}`);
  }
}

function assertPositive(name, value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} debe ser un numero finito mayor que 0, recibido: ${value}`);
  }
}

export function clamp01(value) {
  assertProgress(value);
  return Math.min(1, Math.max(0, value));
}

// Avanza (hovering = true) o retrocede (hovering = false) el progreso segun el tiempo transcurrido.
// La reversa parte siempre del valor actual: nunca reinicia ni salta.
export function step(progress, hovering, dtMs, durationMs = FILL_MS, drainMs = durationMs * DRAIN_RATIO) {
  const p = clamp01(progress);
  if (typeof hovering !== 'boolean') {
    throw new TypeError(`hovering debe ser booleano, recibido: ${hovering}`);
  }
  if (typeof dtMs !== 'number' || !Number.isFinite(dtMs) || dtMs < 0) {
    throw new RangeError(`dtMs debe ser un numero finito >= 0, recibido: ${dtMs}`);
  }
  assertPositive('durationMs', durationMs);
  assertPositive('drainMs', drainMs);
  return hovering ? Math.min(1, p + dtMs / durationMs) : Math.max(0, p - dtMs / drainMs);
}

// true cuando ya no hay nada que animar: lleno con hover o vacio sin hover.
export function isSettled(progress, hovering) {
  const p = clamp01(progress);
  return hovering ? p >= 1 : p <= 0;
}

// El anillo se ve mientras hay hover o mientras queda progreso por vaciar.
export function ringVisible(progress, hovering) {
  return Boolean(hovering) || clamp01(progress) > 0;
}

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const parts = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${parts.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

// Color del anillo segun el progreso: rojo en 0, naranja en 0.5 y verde en 1, interpolado.
export function colorAt(progress) {
  const p = clamp01(progress);
  return p <= 0.5 ? mix(GO_RED, GO_ORANGE, p / 0.5) : mix(GO_ORANGE, GO_GREEN, (p - 0.5) / 0.5);
}

// Etapa legible del color (para pruebas y data-attributes).
export function colorStage(progress) {
  const p = clamp01(progress);
  if (p < 1 / 3) return 'rojo';
  if (p < 0.9) return 'naranja';
  return 'verde';
}

// Transicion al tocar GO. Sin reduccion de movimiento: anillos que salen del boton, alejamiento del
// encabezado con velo a negro, navegacion y entrada de /auth0 desde negro (1.6 s en total).
// Con prefers-reduced-motion: un fundido corto y la navegacion.
export const LAUNCH_MS = Object.freeze({ rings: 400, zoom: 500, enter: 700, fade: 200 });

// Lista de fases con el instante de inicio (at) y la duracion (ms) de cada una.
// La fase 'navigate' marca cuando se cambia de ruta.
export function launchPlan(reduced, ms = LAUNCH_MS) {
  if (typeof reduced !== 'boolean') {
    throw new TypeError(`reduced debe ser booleano, recibido: ${reduced}`);
  }
  for (const key of ['rings', 'zoom', 'enter', 'fade']) assertPositive(`ms.${key}`, ms?.[key]);
  if (reduced) {
    return [
      { phase: 'fade', at: 0, ms: ms.fade },
      { phase: 'navigate', at: ms.fade, ms: 0 },
    ];
  }
  const nav = ms.rings + ms.zoom;
  return [
    { phase: 'rings', at: 0, ms: ms.rings },
    { phase: 'zoom', at: ms.rings, ms: ms.zoom },
    { phase: 'navigate', at: nav, ms: 0 },
    { phase: 'enter', at: nav, ms: ms.enter },
  ];
}

// Duracion total de un plan: el fin de la fase que termina mas tarde.
export function launchTotal(plan) {
  if (!Array.isArray(plan) || plan.length === 0) throw new RangeError('plan debe ser una lista no vacia');
  return Math.max(...plan.map((p) => p.at + p.ms));
}
