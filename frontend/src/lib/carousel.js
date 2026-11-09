// UH16 #219: logica pura del carrusel de la landing (sin React ni DOM).
// Todas las funciones validan la entrada y devuelven siempre un indice en [0, length - 1].

export function isValidLength(length) {
  return Number.isInteger(length) && length > 0;
}

function assertLength(length) {
  if (!isValidLength(length)) {
    throw new RangeError(`length debe ser un entero positivo, recibido: ${length}`);
  }
}

function toIndex(index) {
  if (typeof index !== 'number' || !Number.isFinite(index)) {
    throw new TypeError(`index debe ser un numero finito, recibido: ${index}`);
  }
  return Math.trunc(index);
}

// Indice circular: -1 pasa a length - 1 y length pasa a 0.
export function wrapIndex(index, length) {
  assertLength(length);
  const i = toIndex(index);
  return ((i % length) + length) % length;
}

// Indice acotado: los valores fuera de rango se pegan al extremo mas cercano.
export function clampIndex(index, length) {
  assertLength(length);
  const i = toIndex(index);
  return Math.min(Math.max(i, 0), length - 1);
}

export function nextIndex(index, length, loop = true) {
  return loop ? wrapIndex(toIndex(index) + 1, length) : clampIndex(toIndex(index) + 1, length);
}

export function prevIndex(index, length, loop = true) {
  return loop ? wrapIndex(toIndex(index) - 1, length) : clampIndex(toIndex(index) - 1, length);
}

// Cuantas posiciones de inicio distintas permite el scroll: con varias tarjetas visibles
// las ultimas no pueden quedar alineadas al inicio, asi que hay menos "paginas" que tarjetas.
export function reachableCount(maxScroll, step, total) {
  assertLength(total);
  if (!Number.isFinite(maxScroll) || !Number.isFinite(step) || step <= 0 || maxScroll <= 0) return 1;
  return clampIndex(Math.round(maxScroll / step), total) + 1;
}

// Tarjeta activa a partir del desplazamiento horizontal del contenedor.
export function indexFromScroll(scrollLeft, step, total) {
  assertLength(total);
  if (!Number.isFinite(scrollLeft) || !Number.isFinite(step) || step <= 0) return 0;
  return clampIndex(Math.round(scrollLeft / step), total);
}
