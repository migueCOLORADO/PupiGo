// UH19 #241 / RF #243: mensaje para el conductor segun el estado del permiso de ubicacion.
// Logica pura: no lee navigator ni window, recibe todo por parametro y siempre devuelve un mensaje.

export const TONES = ['ok', 'info', 'warn', 'danger'];

const DENIED_STEPS = [
  'En computador: toca el icono del candado (o de ajustes del sitio) a la izquierda de la direccion, busca "Ubicacion" y elige "Permitir".',
  'En celular: toca el candado o los tres puntos del navegador, entra a "Configuracion del sitio" o "Permisos", abre "Ubicacion" y elige "Permitir". Revisa tambien que la ubicacion del telefono este encendida.',
  'Recarga la pagina y vuelve a tocar "Iniciar recorrido".',
];

const MESSAGES = {
  insecure: {
    tone: 'danger',
    title: 'La ubicacion requiere una conexion segura',
    steps: [
      'El navegador solo permite la ubicacion en paginas con HTTPS o en localhost.',
      'Abre PupiGo con una direccion que empiece por https:// y vuelve a iniciar el recorrido.',
    ],
  },
  unavailable: {
    tone: 'danger',
    title: 'Geolocalizacion no disponible',
    steps: [
      'Este navegador no ofrece geolocalizacion.',
      'Abre PupiGo en un navegador compatible (Chrome, Edge, Firefox o Safari) y vuelve a iniciar el recorrido.',
    ],
  },
  denied: {
    tone: 'danger',
    title: 'Permiso de ubicacion rechazado',
    steps: DENIED_STEPS,
  },
  error: {
    tone: 'warn',
    title: 'No se pudo obtener la ubicacion',
    steps: [
      'Verifica que la ubicacion (GPS) del dispositivo este encendida y que tengas senal.',
      'Vuelve a tocar "Iniciar recorrido" para intentarlo de nuevo.',
    ],
  },
  granted: {
    tone: 'ok',
    title: 'Ubicacion activa',
    steps: [],
  },
  pending: {
    tone: 'info',
    title: 'Permiso de ubicacion pendiente',
    steps: [
      'Al tocar "Iniciar recorrido" el navegador te pedira permiso para usar tu ubicacion.',
      'Elige "Permitir" para compartir la posicion del colectivo con los estudiantes.',
    ],
  },
};

const ALIASES = { prompt: 'pending', unknown: 'pending' };

function copy(key) {
  const m = MESSAGES[key];
  return { tone: m.tone, title: m.title, steps: [...m.steps] };
}

// Recibe { permission, secureContext, hasGeolocation } y devuelve { tone, title, steps[] }.
// secureContext y hasGeolocation solo cuentan cuando son exactamente false (desconocido no bloquea).
export function geoPermissionMessage(input) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.secureContext === false) return copy('insecure');
  if (o.hasGeolocation === false) return copy('unavailable');
  const p = typeof o.permission === 'string' ? o.permission.trim().toLowerCase() : '';
  const has = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
  const key = has(ALIASES, p) ? ALIASES[p] : p;
  if (has(MESSAGES, key)) return copy(key);
  return copy('pending');
}
