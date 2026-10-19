export const STATUS_LABEL = {
  waiting: 'En espera', in_progress: 'En recorrido', completed: 'Completado', cancelled: 'Cancelado',
};

export default function StatusChip({ status, compact }) {
  const active = status === 'waiting' || status === 'in_progress';
  return (
    <div className={`${compact ? 'm-status-chip' : 'status-chip'}${status === 'in_progress' ? '' : ' off'}`} role="status" aria-live="polite">
      <span className="pulse" aria-hidden="true" />{active ? STATUS_LABEL[status] : 'Sin recorrido'}
    </div>
  );
}
