// UH16 #219: imagen que llena su hueco sin escalarse mal.
// Mide el hueco y decide con lib/carousel.js (chooseFit): 'cover' con su punto focal, o 'contain' sobre una
// copia de si misma ampliada y desenfocada (estilo Apple) cuando ampliarla la pixelaria o la recortaria demasiado.
import { useEffect, useRef, useState } from 'react';
import { chooseFit } from '../../lib/carousel';

export default function FitImage({ src, alt = '', natural, focal = '50% 50%', rules, mode: forced, loading, className = '' }) {
  const boxRef = useRef(null);
  const [box, setBox] = useState(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setBox((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    measure();
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Mientras no hay medida se usa contain: nunca muestra una imagen ampliada de mas.
  const mode = forced ?? (box ? chooseFit(natural, box, rules) : 'contain');
  const contain = mode === 'contain';

  return (
    <div ref={boxRef} data-fit={mode} className={`absolute inset-0 overflow-hidden ${className}`}>
      {contain && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          data-role="blur-bg"
          draggable="false"
          className="absolute inset-0 h-full w-full scale-125 select-none object-cover opacity-90 blur-2xl"
          style={{ objectPosition: focal }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        draggable="false"
        data-natural-w={natural.w}
        data-natural-h={natural.h}
        className={`absolute inset-0 h-full w-full select-none ${contain ? 'object-contain' : 'object-cover'}`}
        style={{ objectPosition: focal }}
      />
    </div>
  );
}
