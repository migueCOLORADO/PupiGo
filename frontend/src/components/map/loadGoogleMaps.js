// UH20: carga unica de la Google Maps JavaScript API con un <script> dinamico (sin dependencias npm).
// La promesa se cachea: todos los mapas comparten la misma carga. Si falla (error de red,
// llave invalida via gm_authFailure o timeout) la promesa queda rechazada y se usa el SVG.

const CALLBACK = '__pupigoGoogleMapsReady';
const DEFAULT_TIMEOUT_MS = 10000;

let loadPromise = null;
let authFailed = false;
const authListeners = new Set();

export function googleMapsApiKey() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return typeof key === 'string' ? key.trim() : '';
}

// Google llama a window.gm_authFailure si la llave es invalida o el dominio no esta autorizado,
// lo que puede ocurrir incluso despues de que el script cargo y el mapa se creo.
export function onGoogleMapsAuthFailure(fn) {
  if (authFailed) {
    fn();
    return () => {};
  }
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

export function loadGoogleMaps(apiKey, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!apiKey) return Promise.reject(new Error('Sin llave de Google Maps'));
  if (authFailed) return Promise.reject(new Error('Autenticacion de Google Maps fallida'));
  if (loadPromise) return loadPromise;
  if (window.google?.maps?.Map) return (loadPromise = Promise.resolve(window.google.maps));

  loadPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(value);
    };
    const timer = setTimeout(() => finish(new Error('Tiempo de carga de Google Maps agotado')), timeoutMs);

    window.gm_authFailure = () => {
      authFailed = true;
      finish(new Error('Autenticacion de Google Maps fallida'));
      authListeners.forEach((fn) => fn());
      authListeners.clear();
    };

    window[CALLBACK] = async () => {
      try {
        const maps = window.google?.maps;
        if (!maps) throw new Error('google.maps no disponible');
        if (typeof maps.importLibrary === 'function') await maps.importLibrary('maps');
        if (!maps.Map) throw new Error('google.maps.Map no disponible');
        finish(null, maps);
      } catch (e) {
        finish(e);
      }
    };

    const params = new URLSearchParams({ key: apiKey, v: 'weekly', loading: 'async', callback: CALLBACK, language: 'es', region: 'CO' });
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.defer = true;
    script.dataset.pupigoMaps = 'true';
    script.onerror = () => finish(new Error('No se pudo cargar el script de Google Maps'));
    document.head.appendChild(script);
  });
  return loadPromise;
}
