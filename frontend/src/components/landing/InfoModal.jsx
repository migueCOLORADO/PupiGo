// UH16 #219: ventana emergente con el detalle de una tarjeta.
// Cierra con el boton, con Escape y con clic fuera; mantiene el foco dentro mientras esta abierta.
import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function InfoModal({ card, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const titleId = `pupi-dialog-${card.id}`;

  return (
    <div
      className="pupi-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pupi-dialog flex max-h-[90svh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-soft sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <h2 id={titleId} className="text-xl font-bold text-ink">{card.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-ink hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <img src={card.image} alt="" className="mb-4 aspect-video w-full rounded-sm object-cover" />
          {card.detail.map((p) => (
            <p key={p} className="mb-3 text-sm leading-relaxed text-gray-500 last:mb-0">{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
