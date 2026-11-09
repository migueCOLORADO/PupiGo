// UH16 #219: Landing page "Somos Pupi". F17 la monta en "/" desde App.jsx.
// Encabezado a pantalla completa con foto desenfocada y panel de vidrio esmerilado; debajo, el carrusel.
import { useCallback, useRef, useState } from 'react';
import LandingStyles from '../components/landing/LandingStyles';
import GoButton from '../components/landing/GoButton';
import InfoCarousel from '../components/landing/InfoCarousel';
import InfoModal from '../components/landing/InfoModal';
import { LANDING_CARDS } from '../components/landing/landingContent';
import heroImage from '../assets/landing/fondoPrincipal.jpg';

export default function LandingPage() {
  const [openCard, setOpenCard] = useState(null);
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
      <LandingStyles />

      <header className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink px-4 py-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 scale-105 bg-cover bg-center blur-[3px]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/20" />

        <div className="pupi-glass flex w-full max-w-xl flex-col items-center rounded-3xl px-6 py-8 text-center sm:px-10 md:py-12 landscape:max-lg:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-dark md:text-sm">PupiGo</p>
          <h1 className="mt-2 text-5xl font-black leading-none tracking-tight text-ink sm:text-6xl md:text-7xl landscape:max-lg:text-4xl">
            Somos Pupi
          </h1>
          <p className="mt-3 text-base text-ink/75 md:text-lg landscape:max-lg:mt-2">
            Menos espera, <b className="text-ink">más certeza.</b>
          </p>
          <div className="mt-6 md:mt-8 landscape:max-lg:mt-3">
            <GoButton />
          </div>
        </div>
      </header>

      <main>
        <section aria-labelledby="landing-info-title" className="py-12 lg:py-16">
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
