// UH4: la posicion mostrada es la "ultima conocida" (no en vivo) cuando el recorrido esta en
// curso, hay una posicion previa y (a) la ultima lectura es mas vieja que el intervalo GPS
// esperado o (b) fallo el polling al backend. El marcador NO se oculta en ningun caso.
export function isPositionStale(trip) {
  if (!trip || trip.status !== 'in_progress' || !trip.last_position) return false;
  if (trip.connection_lost) return true;
  const age = trip.position_age_seconds;
  return age != null && age > trip.gps_max_interval_seconds;
}

export function liveLabel(trip, mobile) {
  if (!trip) return 'Sin recorrido activo';
  if (trip.status === 'waiting') return mobile ? 'Pupi Bus en espera' : 'En espera';
  if (isPositionStale(trip)) return 'Última posición conocida';
  return mobile ? 'Pupi Bus en camino' : 'En vivo';
}
