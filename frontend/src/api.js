const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const AUTH_KEY = 'pupigo_auth';

export function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuth(auth) {
  try {
    if (auth) sessionStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    else sessionStorage.removeItem(AUTH_KEY);
  } catch {
    // sin almacenamiento disponible: la sesion solo vive en memoria del contexto
  }
}

async function req(path, opts = {}) {
  const token = getAuth()?.token;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Token ${token}` } : {}) };
  const r = await fetch(BASE + path, { ...opts, headers });
  if (r.status === 401 && token) {
    saveAuth(null);
    window.dispatchEvent(new Event('pupigo:logout'));
  }
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.detail || (data ? JSON.stringify(data) : `HTTP ${r.status}`));
  return data;
}

export const api = {
  activeTrip: () => req('/trips/active/'),
  trip: (id) => req(`/trips/${id}/`),
  createTrip: (direction) => req('/trips/', { method: 'POST', body: JSON.stringify({ direction }) }),
  start: (id) => req(`/trips/${id}/start/`, { method: 'POST' }),
  complete: (id) => req(`/trips/${id}/complete/`, { method: 'POST' }),
  cancel: (id) => req(`/trips/${id}/cancel/`, { method: 'POST' }),
  sendPosition: (id, p) => req(`/trips/${id}/positions/`, { method: 'POST', body: JSON.stringify(p) }),
  login: async (username, password) => {
    const auth = await req('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) });
    saveAuth(auth);
    return auth;
  },
  logout: async () => {
    try {
      await req('/auth/logout/', { method: 'POST' });
    } finally {
      saveAuth(null);
    }
  },
  me: () => req('/auth/me/'),
};
