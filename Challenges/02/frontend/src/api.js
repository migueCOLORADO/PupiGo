const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function req(path, opts = {}) {
  const r = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
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
};
