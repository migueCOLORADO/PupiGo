// UH16 #219: boton circular GO de vidrio esmerilado.
// Hover con puntero fino: el anillo se llena en sentido horario (rojo, naranja, verde) y al salir se vacia
// desde donde iba. Tambien con prefers-reduced-motion: es una animacion pequena y no vestibular.
// Clic o toque: anillos que salen del boton, alejamiento del encabezado (onLaunch avisa la fase) y
// navegacion a /auth0 con state.fromGo. Con prefers-reduced-motion: fundido de 200 ms y navegacion.
// La logica vive en lib/goProgress.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colorAt, colorStage, isSettled, launchPlan, ringVisible, step } from '../../lib/goProgress';

export const GO_TARGET = '/auth0';
const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;
const SIZE = 'clamp(150px, 14vw, 210px)';

function matches(query) {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;
}

export default function GoButton({ to = GO_TARGET, onLaunch }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [phase, setPhase] = useState('idle');
  const progressRef = useRef(0);
  const hoverRef = useRef(false);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const timersRef = useRef([]);

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

  useEffect(() => {
    const timers = timersRef;
    return () => {
      cancelAnimationFrame(frameRef.current);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const setHover = (value) => {
    hoverRef.current = value;
    setHovering(value);
    run();
  };

  const onPointerEnter = (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!matches('(hover: hover) and (pointer: fine)')) return;
    setHover(true);
  };

  const onPointerLeave = () => {
    if (hoverRef.current) setHover(false);
  };

  const go = () => {
    if (phase !== 'idle') return;
    const plan = launchPlan(matches('(prefers-reduced-motion: reduce)'));
    timersRef.current = plan
      .filter((p) => p.phase !== 'enter')
      .map((p) => setTimeout(() => {
        if (p.phase === 'navigate') {
          navigate(to, { state: { fromGo: true } });
          return;
        }
        setPhase(p.phase);
        onLaunch?.(p.phase);
      }, p.at));
  };

  const visible = ringVisible(progress, hovering);
  const color = colorAt(progress);
  const waves = phase === 'rings' || phase === 'zoom';

  return (
    <button
      type="button"
      onClick={go}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      aria-label="GO, entrar a PupiGo"
      aria-busy={phase !== 'idle'}
      data-phase={phase}
      data-progress={progress.toFixed(3)}
      style={{ width: SIZE, height: SIZE }}
      className="pupi-go relative grid shrink-0 place-items-center rounded-full text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {waves && [0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" data-wave={i} className="pupi-go-wave" style={{ animationDelay: `${i * 40}ms` }} />
      ))}
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
      <span aria-hidden="true" className="font-black tracking-wider" style={{ fontSize: 'clamp(2.6rem, 4.2vw, 4rem)' }}>GO</span>
    </button>
  );
}
