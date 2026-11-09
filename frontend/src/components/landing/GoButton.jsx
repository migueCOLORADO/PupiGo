// UH16 #219: boton circular GO de vidrio esmerilado.
// Hover con puntero fino: el anillo se llena en sentido horario (rojo, naranja, verde) y al salir se vacia
// desde donde iba. Clic o toque: pulsacion corta y navegacion a /auth0. La logica vive en lib/goProgress.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colorAt, colorStage, isSettled, ringVisible, step } from '../../lib/goProgress';

export const GO_TARGET = '/auth0';
const PRESS_MS = 260;
const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;

function matches(query) {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;
}

export default function GoButton({ to = GO_TARGET }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);
  const progressRef = useRef(0);
  const hoverRef = useRef(false);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const timerRef = useRef(0);
  const reduced = matches('(prefers-reduced-motion: reduce)');

  const tick = useCallback(function loop(now) {
    const dt = lastRef.current ? Math.min(now - lastRef.current, 100) : 0;
    lastRef.current = now;
    const next = step(progressRef.current, hoverRef.current, Math.max(0, dt));
    progressRef.current = next;
    setProgress(next);
    if (isSettled(next, hoverRef.current)) {
      frameRef.current = 0;
      lastRef.current = 0;
      return;
    }
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const run = useCallback(() => {
    if (frameRef.current) return;
    lastRef.current = 0;
    frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    clearTimeout(timerRef.current);
  }, []);

  const setHover = (value) => {
    hoverRef.current = value;
    setHovering(value);
    run();
  };

  const onPointerEnter = (e) => {
    if (reduced || e.pointerType !== 'mouse') return;
    if (!matches('(hover: hover) and (pointer: fine)')) return;
    setHover(true);
  };

  const onPointerLeave = () => {
    if (hoverRef.current) setHover(false);
  };

  const go = () => {
    if (pressing) return;
    if (reduced) {
      navigate(to);
      return;
    }
    setPressing(true);
    timerRef.current = setTimeout(() => navigate(to), PRESS_MS);
  };

  const visible = !reduced && ringVisible(progress, hovering);
  const color = colorAt(progress);

  return (
    <button
      type="button"
      onClick={go}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      aria-label="GO, entrar a PupiGo"
      aria-busy={pressing}
      data-phase={pressing ? 'pressing' : 'idle'}
      data-progress={progress.toFixed(3)}
      className="pupi-go relative grid h-28 w-28 place-items-center rounded-full text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:h-32 md:w-32"
    >
      <svg viewBox="0 0 104 104" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="52" cy="52" r={R} fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.5" />
        <circle
          className="pupi-go-ring"
          data-visible={visible ? 'true' : 'false'}
          data-color={colorStage(progress)}
          cx="52"
          cy="52"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          transform="rotate(-90 52 52)"
        />
      </svg>
      <span aria-hidden="true" className="text-4xl font-black tracking-wider md:text-5xl">GO</span>
    </button>
  );
}
