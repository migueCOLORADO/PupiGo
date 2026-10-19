// UH9 #115: ayuda contextual sobre los estados del recorrido.
// Popover accesible (aria) junto al chip de estado. Clases nuevas uh9-*.
import { useEffect, useRef, useState } from 'react';

// Texto por estado: que significa y que debe hacer el usuario.
export const STATE_HELP = [
  ['none', 'Sin recorrido', 'No hay un colectivo activo. Espera a que el conductor ponga uno en espera.'],
  ['waiting', 'En espera', 'El colectivo esta en el punto de salida y aun no arranca. Es buen momento para acercarte.'],
  ['in_progress', 'En recorrido', 'El colectivo va en camino y comparte su ubicacion en vivo. Revisa el tiempo estimado de llegada.'],
  ['completed', 'Completado', 'El recorrido llego a su destino. Espera el proximo colectivo.'],
  ['cancelled', 'Cancelado', 'El conductor cancelo el recorrido. Ya no hay colectivo activo por ahora.'],
];

export default function StatusHelp({ current }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const key = current || 'none';
  return (
    <span className="uh9-help" ref={ref}>
      <button type="button" className="uh9-help-btn" aria-expanded={open} aria-label="Ayuda sobre los estados del recorrido"
        onClick={() => setOpen((v) => !v)}>?</button>
      {open && (
        <div className="uh9-help-pop" role="dialog" aria-label="Estados del recorrido">
          <div className="uh9-help-h"><span className={`uh9-help-badge ${key}`} />Estados del recorrido</div>
          {STATE_HELP.map(([k, label, desc]) => (
            <div className="uh9-help-row" key={k}>
              <span className="k">{label}:</span><span className="v">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}
