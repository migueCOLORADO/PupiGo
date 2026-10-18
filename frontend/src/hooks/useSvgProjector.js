import { useCallback, useLayoutEffect, useReducer } from 'react';

// Convierte coordenadas del viewBox del SVG a px relativos al contenedor del mapa.
// Respeta preserveAspectRatio="xMidYMid slice", asi los marcadores quedan exactamente sobre el dibujo.
export function useSvgProjector(svgRef, containerRef) {
  const [, force] = useReducer((x) => x + 1, 0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => force());
    ro.observe(el);
    window.addEventListener('resize', force);
    return () => { ro.disconnect(); window.removeEventListener('resize', force); };
  }, [containerRef]);

  return useCallback((x, y) => {
    const svg = svgRef.current, el = containerRef.current;
    if (!svg || !el) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(x, y).matrixTransform(ctm);
    const r = el.getBoundingClientRect();
    return { left: p.x - r.left, top: p.y - r.top };
  }, [svgRef, containerRef]);
}
