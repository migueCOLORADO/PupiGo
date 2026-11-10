// UH16 #219: Landing page "Somos Pupi". F17 la monta en "/" desde App.jsx.
// Encabezado a pantalla completa con foto desenfocada (HeroBackdrop), barra superior con el logo y el enlace
// "Conoce PupiGo", y un degradado que lleva el encabezado al fondo de la seccion del carrusel.
import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GoButton from '../components/landing/GoButton';
import HeroBackdrop from '../components/landing/HeroBackdrop';
import InfoCarousel from '../components/landing/InfoCarousel';
import InfoModal from '../components/landing/InfoModal';
import { LANDING_CARDS } from '../components/landing/landingContent';
import heroImage from '../assets/landing/fondoPrincipal.jpg';
import logo from '../assets/logo.png';

const SECTION_ID = 'conoce-pupigo';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function TopBar() {
  const goToSection = (e) => {
    const target = document.getElementById(SECTION_ID);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <nav aria-label="Principal" className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-5">
      <Link
        to="/"
        aria-label="PupiGo, inicio"
        className="flex h-8 items-center rounded-full bg-white px-3 shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink md:h-10 md:px-4"
      >
        <img src={logo} alt="" className="h-6 w-auto brightness-[1.04] md:h-8" />
      </Link>
      <a
        href={`#${SECTION_ID}`}
        onClick={goToSection}
        className="pupi-topbar-link rounded-full px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-base"
      >
        Conoce PupiGo
      </a>
    </nav>
  );
}

export default function LandingPage() {
  const [openCard, setOpenCard] = useState(null);
  const [exit, setExit] = useState(null);
  const openerRef = useRef(null);

  const expand = useCallback((card, opener) => {
    openerRef.current = opener;
    setOpenCard(card);
  }, []);

  const close = useCallback(() => {
    setOpenCard(null);
    openerRef.current?.focus();
  }, []);

  return (
    <div className="pupi-motion min-h-screen overflow-x-hidden bg-gray-25 font-sans text-ink">
      <HeroBackdrop as="header" image={heroImage} variant="clear" panelClassName="max-w-xl" exit={exit} topBar={<TopBar />} fadeOut>
        <p className="pupi-text-shadow text-xs font-semibold uppercase tracking-[0.3em] text-white md:text-sm">PupiGo</p>
        <h1
          data-contrast="title"
          className="pupi-text-shadow mt-2 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl md:text-7xl landscape:max-lg:text-4xl"
        >
          Somos Pupi
        </h1>
        <p data-contrast="slogan" className="pupi-text-shadow mt-3 text-base text-white md:text-lg landscape:max-lg:mt-2">
          Menos espera, <b>más certeza.</b>
        </p>
        <div className="mt-6 md:mt-8 landscape:max-lg:mt-3">
          <GoButton onLaunch={setExit} />
        </div>
      </HeroBackdrop>

      <main>
        <section id={SECTION_ID} aria-labelledby="landing-info-title" className="scroll-mt-4 pb-12 pt-2 lg:pb-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 id="landing-info-title" className="text-2xl font-bold text-ink md:text-3xl">Conoce PupiGo</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500 md:text-base">
              La aplicación web para ver en tiempo real el colectivo entre EAFIT y el metro.
            </p>
          </div>
          <div className="mt-6 md:mt-8">
            <InfoCarousel cards={LANDING_CARDS} onExpand={expand} paused={Boolean(openCard)} />
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
        PupiGo · Menos espera, más certeza. · Proyecto Integrador 1, Universidad EAFIT
      </footer>

      {openCard && <InfoModal card={openCard} onClose={close} />}
    </div>
  );
}
