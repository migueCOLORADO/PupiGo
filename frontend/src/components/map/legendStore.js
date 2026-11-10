import { useSyncExternalStore } from 'react';

// UH20: entradas de la leyenda publicadas por el mapa de Google (mapIndicators de lib/mapMarkers.js).
// null = no hay mapa de Google dibujado (mapa SVG de respaldo): la leyenda queda como antes.
let current = null;
const listeners = new Set();

export function publishLegend(items) {
  current = items;
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function useMapLegend() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
