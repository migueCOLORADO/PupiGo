import { IconBus, PinEafit, PinMetro, PinStop } from './icons';

const PIN = { metro: PinMetro, stop: PinStop, eafit: PinEafit };

export function Pin({ kind, caption, minor, pos, simple }) {
  if (!pos) return null;
  const Icon = PIN[kind];
  return (
    <div className={`marker${minor ? ' minor' : ''}`} style={{ left: pos.left, top: pos.top }}>
      <div className={`pin ${kind}`}><Icon simple={simple} /></div>
      {caption && <div className="marker-caption">{caption}</div>}
    </div>
  );
}

// UH4: `stale` = se muestra la ultima posicion conocida (sin datos frescos); el marcador
// permanece en el mapa pero sin pulso "en vivo" (estilos en index.css: .bus-marker-wrap.stale).
export function BusMarker({ pos, live, stale, simple }) {
  if (!pos) return null;
  return (
    <div className={`marker center bus-marker-wrap${live ? '' : ' waiting'}${stale ? ' stale' : ''}`}
      style={{ left: pos.left, top: pos.top }}>
      <div className="bus-marker">
        <div className="bus-ring" />
        <div className="bus-core"><IconBus simple={simple} /></div>
      </div>
    </div>
  );
}