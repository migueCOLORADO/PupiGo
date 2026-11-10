// UH16 #219: carrusel de diapositivas grandes con la activa centrada y las vecinas asomando.
// Celular: deslizamiento con el dedo (scroll-snap). PC (>= 1024 px y puntero fino): sin barra horizontal,
// flechas que aparecen al acercar el cursor al 10 % de cada borde y teclas izquierda/derecha.
// Avance automatico cada 6 s que se pausa con hover, foco, el boton de pausa o prefers-reduced-motion.
// La aritmetica vive en lib/carousel.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { centerScrollLeft, edgeZone, nearestIndex, nextIndex, prevIndex } from '../../lib/carousel';
import FitImage from './FitImage';

export const AUTOPLAY_MS = 6000;
const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

function matches(query) {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;
}

function useMedia(query) {
  const [value, setValue] = useState(() => matches(query));
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(query);
    const onChange = () => setValue(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return value;
}

function Chevron({ dir, className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayPauseIcon({ playing }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      {playing
        ? <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" />
        : <path d="M8 5l11 7-11 7z" fill="currentColor" />}
    </svg>
  );
}

export default function InfoCarousel({ cards, onExpand, paused = false }) {
  const regionRef = useRef(null);
  const trackRef = useRef(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(() => !matches('(prefers-reduced-motion: reduce)'));
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [zone, setZone] = useState(null);
  const desktop = useMedia(DESKTOP_QUERY);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const total = cards.length;

  const slides = useCallback(() => [...(trackRef.current?.children ?? [])], []);

  const sync = useCallback(() => {
    const el = trackRef.current;
    const list = slides();
    if (!el || list.length === 0) return;
    const centers = list.map((s) => s.offsetLeft + s.offsetWidth / 2);
    setActive(nearestIndex(el.scrollLeft + el.clientWidth / 2, centers));
  }, [slides]);

  const goTo = useCallback((index) => {
    const el = trackRef.current;
    const slide = slides()[index];
    if (!el || !slide) return;
    setActive(index);
    const left = centerScrollLeft(slide.offsetLeft, slide.offsetWidth, el.clientWidth, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left, behavior: matches('(prefers-reduced-motion: reduce)') ? 'auto' : 'smooth' });
  }, [slides]);

  const next = useCallback(() => goTo(nextIndex(active, total)), [active, total, goTo]);
  const prev = useCallback(() => goTo(prevIndex(active, total)), [active, total, goTo]);

  // Mantiene centrada la diapositiva activa al cambiar el tamano de la ventana.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const recenter = () => {
      const slide = slides()[activeRef.current];
      if (!slide) return;
      el.scrollLeft = centerScrollLeft(slide.offsetLeft, slide.offsetWidth, el.clientWidth, el.scrollWidth - el.clientWidth);
    };
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(recenter);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', recenter);
    return () => window.removeEventListener('resize', recenter);
  }, [slides]);

  useEffect(() => {
    const f = frame;
    return () => cancelAnimationFrame(f.current);
  }, []);

  const autoplay = playing && !reduced && !paused && !hovered && !focused && total > 1;
  useEffect(() => {
    if (!autoplay) return undefined;
    const t = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [autoplay, next]);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(sync);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  const onMouseMove = (e) => {
    if (!desktop || !regionRef.current) return;
    const rect = regionRef.current.getBoundingClientRect();
    setZone(edgeZone(e.clientX - rect.left, rect.width, 0.1));
  };

  const onMouseLeave = () => {
    setHovered(false);
    setZone(null);
  };

  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  };

  const arrow = (dir) => {
    const visible = desktop && zone === dir && total > 1;
    return (
      <button
        type="button"
        data-visible={visible ? 'true' : 'false'}
        aria-hidden={visible ? undefined : 'true'}
        tabIndex={visible ? 0 : -1}
        aria-label={dir === 'left' ? 'Diapositiva anterior' : 'Diapositiva siguiente'}
        onClick={dir === 'left' ? prev : next}
        className={`pupi-arrow absolute top-1/2 z-10 grid h-14 w-14 place-items-center rounded-full bg-white/85 text-ink shadow-soft backdrop-blur hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${desktop ? '' : 'hidden'} ${dir === 'left' ? 'left-6' : 'right-6'}`}
      >
        <Chevron dir={dir} />
      </button>
    );
  };

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Información sobre PupiGo"
      className="relative"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          tabIndex={0}
          aria-label="Diapositivas informativas, usa las flechas o desliza para ver más"
          className="pupi-track relative flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-[8%] py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue md:gap-5 md:px-[7.5%]"
        >
          {cards.map((card, i) => {
            const contain = card.fit === 'contain';
            return (
              <article
                key={card.id}
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${total}: ${card.title}`}
                data-active={i === active ? 'true' : 'false'}
                className="pupi-slide relative h-[min(72vh,624px)] min-h-[240px] w-full shrink-0 snap-center overflow-hidden rounded-2xl bg-ink shadow-soft lg:h-[min(72vh,768px)]"
                style={contain ? { backgroundColor: card.bg } : undefined}
              >
                {contain ? (
                  // Logo e ilustracion completos, sin ampliarse mas de 1.5 veces su tamano natural.
                  <div className="absolute left-[10%] top-[7%] flex h-[50%] w-[80%] items-center justify-center">
                    <img
                      src={card.image}
                      alt={card.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      draggable="false"
                      data-natural-w={card.natural.w}
                      data-natural-h={card.natural.h}
                      style={{ width: card.natural.w * 1.5, aspectRatio: `${card.natural.w} / ${card.natural.h}` }}
                      className={`max-h-full max-w-full select-none object-contain ${card.whiten ? 'brightness-[1.04]' : ''}`}
                    />
                  </div>
                ) : (
                  <FitImage src={card.image} alt={card.alt} natural={card.natural} focal={card.focal} loading={i === 0 ? 'eager' : 'lazy'} />
                )}
                <div className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${contain ? 'h-[45%]' : 'h-3/4'}`} />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 md:flex-row md:items-end md:justify-between md:gap-8 md:p-8 lg:p-10">
                  <div className="min-w-0 max-w-3xl text-white">
                    <h3 className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">{card.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/85 md:line-clamp-3 md:text-base lg:text-lg">{card.summary}</p>
                  </div>
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={(e) => onExpand(card, e.currentTarget)}
                    className="shrink-0 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-card hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-safe:transition-colors md:self-end md:px-6 md:py-3 md:text-base"
                  >
                    Ampliar<span className="sr-only">: {card.title}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {arrow('left')}
        {arrow('right')}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <div className="flex h-10 items-center gap-2.5 rounded-full bg-gray-100 px-4">
          {cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              aria-label={`Ir a ${card.title}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue motion-safe:transition-all ${i === active ? 'w-6 bg-ink' : 'w-2 bg-gray-400 hover:bg-gray-500'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing && !reduced ? 'Pausar carrusel' : 'Reproducir carrusel'}
          aria-pressed={!(playing && !reduced)}
          disabled={reduced}
          data-playing={playing && !reduced ? 'true' : 'false'}
          className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-ink hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue disabled:opacity-40"
        >
          <PlayPauseIcon playing={playing && !reduced} />
        </button>
      </div>
    </div>
  );
}
