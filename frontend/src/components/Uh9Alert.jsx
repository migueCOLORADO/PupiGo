// UH9 #114: mensaje de error / estado excepcional con accion de recuperacion.
// Clases nuevas (uh9-*) para no chocar con estilos compartidos.

function IcoAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13.5" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Uh9Alert({ variant = 'danger', title, message, actionLabel, onAction, disabled }) {
  return (
    <div className={`uh9-alert ${variant}`} role="alert">
      <span className="uh9-alert-ico" aria-hidden="true"><IcoAlert /></span>
      <div className="uh9-alert-body">
        {title && <div className="uh9-alert-title">{title}</div>}
        {message && <div className="uh9-alert-msg">{message}</div>}
        {actionLabel && onAction && (
          <button type="button" className="uh9-recover-btn" onClick={onAction} disabled={disabled}>{actionLabel}</button>
        )}
      </div>
    </div>
  );
}
