// UH16 #219: ventana emergente con el detalle de una diapositiva.
// Ocupa la mayor parte de la pantalla: imagen arriba en vertical y al costado en horizontal, texto con scroll.
// Entra con escala y fundido; cierra con el boton, con Escape y con clic fuera, con animacion de salida.
// Mantiene el foco dentro mientras esta abierta; LandingPage lo devuelve al boton que la abrio.
import { useCallback, useEffect, useRef, useState } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 200;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function InfoModal({ card, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const timerRef = useRef(0);
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => {
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    if (timerRef.current) return;
    setClosing(true);
    timerRef.current = setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
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
  }, [requestClose]);

  useEffect(() => {
    const t = timerRef;
    return () => clearTimeout(t.current);
  }, []);

  const titleId = `pupi-dialog-${card.id}`;
  const state = closing ? 'closing' : 'open';
  const contain = card.fit === 'contain';

  return (
    <div
      className="pupi-backdrop fixed inset-0 z-50 grid place-items-center p-2"
      data-state={state}
      onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-state={state}
        className="pupi-dialog overflow-hidden rounded-2xl bg-white shadow-soft"
      >
        <div className="pupi-dialog-media relative overflow-hidden bg-ink" style={contain ? { backgroundColor: card.bg } : undefined}>
          <img
            src={card.image}
            alt=""
            className={`h-full w-full ${contain ? 'object-contain p-[8%]' : 'object-cover'} ${card.whiten ? 'brightness-[1.04]' : ''}`}
          />
        </div>
        <div className="pupi-dialog-body flex flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 md:px-8 md:py-6">
            <h2 id={titleId} className="text-xl font-bold text-ink md:text-3xl">{card.title}</h2>
            <button
              ref={closeRef}
              type="button"
              onClick={requestClose}
              aria-label="Cerrar"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100 text-ink hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-8 md:py-6" tabIndex={0} aria-label={`Detalle: ${card.title}`}>
            {card.detail.map((p) => (
              <p key={p} className="mb-4 text-sm leading-relaxed text-gray-500 last:mb-0 md:text-base lg:text-lg">{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
