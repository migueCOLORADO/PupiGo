export function secondsSince(iso, now = Date.now()) {
  if (!iso) return null;
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
}

export function formatAgo(s, long = false) {
  if (s == null) return '—';
  if (s < 60) return long ? `Hace ${s} segundo${s === 1 ? '' : 's'}` : `Hace ${s}s`;
  const m = Math.floor(s / 60);
  return long ? `Hace ${m} min` : `Hace ${m}m`;
}
