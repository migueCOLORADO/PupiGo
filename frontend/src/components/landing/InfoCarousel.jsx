// UH16 #219: carrusel de tarjetas con scroll-snap (deslizable con el dedo en celular)
// y botones anterior/siguiente. La aritmetica de indices vive en lib/carousel.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { indexFromScroll, nextIndex, prevIndex, reachableCount } from '../../lib/carousel';

function readMetrics(el, total) {
  if (!el || el.children.length === 0) return null;
  const first = el.children[0];
  const second = el.children[1];
  const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  const maxScroll = el.scrollWidth - el.clientWidth;
  return { step, maxScroll, pages: reachableCount(maxScroll, step, total) };
}

function scrollBehavior() {
  const reduce = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduce ? 'auto' : 'smooth';
}

function Arrow({ dir }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InfoCarousel({ cards, onExpand }) {
  const trackRef = useRef(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [pages, setPages] = useState(cards.length);

  const sync = useCallback(() => {
    const el = trackRef.current;
    const m = readMetrics(el, cards.length);
    if (!m) return;
    setPages(m.pages);
    setActive(indexFromScroll(el.scrollLeft, m.step, m.pages));
  }, [cards.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    // ResizeObserver dispara la primera medicion de forma asincrona y en cada cambio de ancho.
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => sync());
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  useEffect(() => {
    const f = frame;
    return () => cancelAnimationFrame(f.current);
  }, []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(sync);
  };

  const goTo = (index) => {
    const el = trackRef.current;
    const m = readMetrics(el, cards.length);
    if (!m) return;
    setActive(index);
    el.scrollTo({ left: Math.min(index * m.step, m.maxScroll), behavior: scrollBehavior() });
  };

  const navBtn = 'grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-ink shadow-card hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue disabled:opacity-40';

  return (
    <div role="region" aria-roledescription="carrusel" aria-label="Información sobre PupiGo">
      <div
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Tarjetas informativas, desliza para ver más"
        className="pupi-track flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue md:gap-6"
      >
        {cards.map((card, i) => (
          <article
            key={card.id}
            aria-roledescription="tarjeta"
            aria-label={`${i + 1} de ${cards.length}: ${card.title}`}
            className="relative flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-md bg-white shadow-card sm:w-[60%] md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]"
          >
            <img src={card.image} alt={card.alt} loading="lazy" className="aspect-video w-full object-cover" />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-bold text-ink">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{card.summary}</p>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(e) => onExpand(card, e.currentTarget)}
                className="mt-4 self-start rounded-sm bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 motion-safe:transition-colors"
              >
                Ampliar<span className="sr-only">: {card.title}</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" className={navBtn} aria-label="Tarjeta anterior"
          disabled={pages < 2} onClick={() => goTo(prevIndex(active, pages))}>
          <Arrow dir="left" />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la posición ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue motion-safe:transition-all ${i === active ? 'w-6 bg-blue' : 'w-2.5 bg-gray-400'}`}
            />
          ))}
        </div>
        <button type="button" className={navBtn} aria-label="Tarjeta siguiente"
          disabled={pages < 2} onClick={() => goTo(nextIndex(active, pages))}>
          <Arrow dir="right" />
        </button>
      </div>
    </div>
  );
}
