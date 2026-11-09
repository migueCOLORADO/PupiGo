// UH16 #219: boton circular GO. Hover: anillo tipo carga. Clic: animacion y navegacion a /auth0.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const GO_TARGET = '/auth0';
const LAUNCH_MS = 800;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function GoButton({ to = GO_TARGET }) {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const t = timer;
    return () => clearTimeout(t.current);
  }, []);

  const go = () => {
    if (launching) return;
    if (prefersReducedMotion()) {
      navigate(to);
      return;
    }
    setLaunching(true);
    timer.current = setTimeout(() => navigate(to), LAUNCH_MS);
  };

  return (
    <button
      type="button"
      onClick={go}
      data-phase={launching ? 'launching' : 'idle'}
      aria-busy={launching}
      className="pupi-go group relative grid h-28 w-28 place-items-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-amber focus-visible:ring-offset-2 md:h-32 md:w-32"
    >
      <svg viewBox="0 0 104 104" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="52" cy="52" r="48" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="4" />
        <circle className="pupi-go-ring" cx="52" cy="52" r="48" fill="none" stroke="#F6A609"
          strokeWidth="5" strokeLinecap="round" strokeDasharray="70 232" />
        <circle className="pupi-go-progress" cx="52" cy="52" r="48" fill="none" stroke="#F6A609"
          strokeWidth="5" strokeLinecap="round" strokeDasharray="302" strokeDashoffset="302"
          transform="rotate(-90 52 52)" />
      </svg>
      <span className="pupi-go-core grid h-[82%] w-[82%] place-items-center rounded-full bg-blue text-4xl font-black tracking-wider text-white shadow-float motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-105 group-active:scale-95 md:text-5xl">
        GO
      </span>
      <span className="sr-only">{launching ? 'Entrando a PupiGo' : 'Entrar a PupiGo'}</span>
    </button>
  );
}
