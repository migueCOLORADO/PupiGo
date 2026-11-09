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

function finiteOr(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

// scrollLeft que deja centrada una diapositiva, acotado a [0, maxScroll].
export function centerScrollLeft(slideLeft, slideWidth, viewportWidth, maxScroll) {
  const target = finiteOr(slideLeft, 0) - (finiteOr(viewportWidth, 0) - finiteOr(slideWidth, 0)) / 2;
  const max = Math.max(0, finiteOr(maxScroll, 0));
  return Math.min(max, Math.max(0, target));
}

// Indice del centro mas cercano a una posicion. centers es la lista de centros de cada diapositiva.
export function nearestIndex(position, centers) {
  if (!Array.isArray(centers) || centers.length === 0) {
    throw new RangeError('centers debe ser una lista no vacia');
  }
  const pos = finiteOr(position, 0);
  let best = 0;
  let bestDist = Infinity;
  centers.forEach((c, i) => {
    const d = Math.abs(finiteOr(c, Infinity) - pos);
    if (d < bestDist) {
      best = i;
      bestDist = d;
    }
  });
  return best;
}

// Franja del borde donde esta el cursor: 'left' o 'right' si x cae dentro del fraction del ancho
// en ese lado, null en el centro o con datos invalidos.
export function edgeZone(x, width, fraction = 0.1) {
  if (![x, width, fraction].every((v) => typeof v === 'number' && Number.isFinite(v))) return null;
  if (width <= 0 || fraction <= 0 || fraction > 0.5 || x < 0 || x > width) return null;
  const band = width * fraction;
  if (x <= band) return 'left';
  if (x >= width - band) return 'right';
  return null;
}
