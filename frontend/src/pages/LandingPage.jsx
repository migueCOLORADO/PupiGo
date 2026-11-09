// UH16 #219: Landing page "Somos Pupi". F17 la monta en "/" desde App.jsx.
import { useCallback, useRef, useState } from 'react';
import LandingStyles from '../components/landing/LandingStyles';
import BusIllustration from '../components/landing/BusIllustration';
import GoButton from '../components/landing/GoButton';
import InfoCarousel from '../components/landing/InfoCarousel';
import InfoModal from '../components/landing/InfoModal';
import { LANDING_CARDS } from '../components/landing/landingContent';

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

      <header className="relative overflow-hidden bg-gradient-to-b from-[#BFDBFE] via-[#EFF6FF] to-[#F3F1EA]">
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-10 text-center md:pt-14 lg:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-dark md:text-sm">PupiGo</p>
          <h1 className="mt-2 text-5xl font-black leading-none tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
            Somos Pupi
          </h1>
          <p className="mt-3 text-base text-gray-500 md:text-lg">
            Menos espera, <b className="text-ink">más certeza.</b>
          </p>
          <div className="mt-6 md:mt-8">
            <GoButton />
          </div>
        </div>
        <BusIllustration className="relative -mt-4 block h-[220px] w-full md:h-[300px] lg:h-[340px]" />
      </header>

      <main>
        <section aria-labelledby="landing-info-title" className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:py-16">
          <h2 id="landing-info-title" className="text-2xl font-bold text-ink md:text-3xl">Conoce PupiGo</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 md:text-base">
            La aplicación web para ver en tiempo real el colectivo entre EAFIT y el metro.
          </p>
          <div className="mt-6 md:mt-8">
            <InfoCarousel cards={LANDING_CARDS} onExpand={expand} />
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
