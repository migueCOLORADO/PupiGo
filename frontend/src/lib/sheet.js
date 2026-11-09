// UH18: logica pura de la tarjeta inferior movil (sin React ni DOM).
// Convencion: delta y velocidad positivos = arrastre hacia abajo (contraer).

export const COLLAPSED = 'collapsed';
export const EXPANDED = 'expanded';
export const SHEET_STATES = [COLLAPSED, EXPANDED];

export const TOP_CHROME_PX = 104; // .m-topbar (52) + selector de sentido; medido 100.5 px en 360x640
export const COLLAPSED_PX = 132; // asa + boton + resumen del recorrido
export const MIN_COLLAPSED_PX = 48; // nunca menos que el asa con su boton
export const EXPANDED_RATIO = 0.82; // fraccion del viewport que ocupa expandida
export const MIN_MAP_RATIO = 0.6; // contraida, el mapa visible es al menos el 60 % del viewport
export const FLING_VELOCITY = 0.5; // px/ms: un gesto rapido decide por su direccion
export const DRAG_THRESHOLD_PX = 64; // distancia minima para cambiar de estado con gesto lento
export const DEFAULT_VIEWPORT = 844;

const finite = (n, fallback = 0) => (typeof n === 'number' && Number.isFinite(n) ? n : fallback);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function normalizeState(state) {
  return state === EXPANDED ? EXPANDED : COLLAPSED;
}

export function normalizeViewport(vh) {
  const v = finite(vh, DEFAULT_VIEWPORT);
  return v > 0 ? v : DEFAULT_VIEWPORT;
}

// Alturas en px de cada estado para un alto de viewport dado.
export function sheetHeights(viewportHeight) {
  const vh = normalizeViewport(viewportHeight);
  const maxCollapsed = Math.floor(vh * (1 - MIN_MAP_RATIO)) - TOP_CHROME_PX;
  // la regla del 60 % de mapa manda; solo en viewports < 380 px de alto la tarjeta baja de MIN_COLLAPSED_PX
  const collapsed = maxCollapsed >= MIN_COLLAPSED_PX ? Math.min(COLLAPSED_PX, maxCollapsed) : Math.max(0, maxCollapsed);
  const expanded = Math.max(collapsed, Math.min(Math.round(vh * EXPANDED_RATIO), vh - TOP_CHROME_PX));
  return { collapsed, expanded, viewportHeight: vh };
}

// Px de mapa que quedan visibles entre la barra superior y la tarjeta.
export function mapVisiblePx(sheetHeight, viewportHeight) {
  return normalizeViewport(viewportHeight) - TOP_CHROME_PX - finite(sheetHeight);
}

// Alto de la tarjeta mientras el dedo la arrastra (acotado entre contraida y expandida).
export function dragHeight(state, delta, viewportHeight) {
  const h = sheetHeights(viewportHeight);
  const start = normalizeState(state) === EXPANDED ? h.expanded : h.collapsed;
  return clamp(start - finite(delta), h.collapsed, h.expanded);
}

// Estado final al soltar: un gesto rapido manda por su direccion; uno lento debe superar el umbral.
export function resolveSheet({ state, delta, velocity, viewportHeight } = {}) {
  const from = normalizeState(state);
  const d = finite(delta);
  const v = finite(velocity);
  const h = sheetHeights(viewportHeight);
  const threshold = Math.min(DRAG_THRESHOLD_PX, (h.expanded - h.collapsed) / 4);
  let to = from;
  if (Math.abs(v) >= FLING_VELOCITY) to = v > 0 ? COLLAPSED : EXPANDED;
  else if (from === COLLAPSED && -d >= threshold && -d > 0) to = EXPANDED;
  else if (from === EXPANDED && d >= threshold && d > 0) to = COLLAPSED;
  return { state: to, height: to === EXPANDED ? h.expanded : h.collapsed, ...h };
}

export function toggleSheet(state) {
  return normalizeState(state) === EXPANDED ? COLLAPSED : EXPANDED;
}
