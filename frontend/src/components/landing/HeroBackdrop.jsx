// UH16 y UH17: fondo a pantalla completa con foto levemente desenfocada y un panel centrado.
// Lo comparten la landing ("/"), la seleccion de rol ("/auth0") y la verificacion del conductor ("/auth0-cond").
// exit: fase de salida que dicta el boton GO ('rings', 'zoom' o 'fade'); el velo negro sube y, en 'zoom',
// todo el encabezado se aleja. Al llegar desde GO (state.fromGo) la pagina entra desde negro con el fondo
// desenfocado que se enfoca. Con prefers-reduced-motion no hay entrada animada.
import { useLocation } from 'react-router-dom';
import LandingStyles from './LandingStyles';

// glass: panel de vidrio claro con texto oscuro. clear: sin caja, texto blanco sobre un velo radial leve.
const PANEL = {
  glass: 'pupi-glass rounded-3xl px-6 py-8 sm:px-10 md:py-12',
  clear: 'pupi-clear px-4 py-6 sm:px-10',
};

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function HeroBackdrop({
  image,
  as: Tag = 'div',
  variant = 'glass',
  exit = null,
  topBar = null,
  fadeOut = false,
  className = '',
  panelClassName = '',
  children,
}) {
  const location = useLocation();
  const entering = Boolean(location.state?.fromGo) && !prefersReducedMotion();

  return (
    <Tag
      className={`pupi-hero pupi-motion relative z-20 bg-ink ${className}`}
      data-exit={exit ?? undefined}
      data-enter={entering ? 'go' : undefined}
    >
      <div className="pupi-hero-stage relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pupi-hero-bg absolute inset-0 -z-10 scale-105 bg-cover bg-center blur-[3px]"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/20" />
        {topBar}
        <div className="flex min-h-[100svh] items-center justify-center px-4 pb-10 pt-20 landscape:max-lg:pb-4 landscape:max-lg:pt-14">
          <div className={`pupi-hero-panel flex w-full flex-col items-center text-center ${PANEL[variant] ?? PANEL.glass} ${panelClassName}`}>
            {children}
          </div>
        </div>
        {fadeOut && <div aria-hidden="true" className="pupi-hero-fade h-40 md:h-60" />}
      </div>
      <div aria-hidden="true" className="pupi-veil pupi-keep-motion pointer-events-none fixed inset-0 z-[60] bg-black" />
      <LandingStyles />
    </Tag>
  );
}
