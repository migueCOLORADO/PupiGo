import { LegendBus, LegendEafit, LegendMetro, LegendStop } from './icons';
import { useMapLegend } from './legendStore';

const ITEMS = [
  ['bus', LegendBus, 'Pupi Bus'],
  ['metro', LegendMetro, 'Estación Aguacatala'],
  ['stop', LegendStop, 'Paradero La Aguacatala'],
  ['eafit', LegendEafit, 'Entrada Las Hermosas'],
];
const ICONS = Object.fromEntries(ITEMS.map(([k, Icon]) => [k, Icon]));

// Muestra de la linea igual a la del mapa: solida con flecha (direccion elegida) o punteada y tenue.
function LineSwatch({ color, dashed }) {
  return (
    <svg className="legend-route" width="28" height="12" viewBox="0 0 28 12" aria-hidden="true">
      {dashed
        ? <line x1="1" y1="6" x2="27" y2="6" stroke={color} strokeOpacity="0.45" strokeWidth="3" strokeDasharray="5 4" />
        : <><line x1="1" y1="6" x2="20" y2="6" stroke={color} strokeOpacity="0.9" strokeWidth="4" />
          <path d="M18 1.5L27 6l-9 4.5z" fill={color} /></>}
    </svg>
  );
}

export default function Legend() {
  const items = useMapLegend();
  // Mapa SVG de respaldo: leyenda fija.
  if (!items) {
    return (
      <div className="legend">
        {ITEMS.map(([k, Icon, label]) => (
          <div className="legend-item" key={k}>
            <div className={`legend-swatch ${k}`}><Icon /></div>
            <span className="label">{label}</span>
          </div>
        ))}
        <div className="legend-item"><div className="legend-line" /><span className="label">Ruta del recorrido</span></div>
      </div>
    );
  }
  // Mapa de Google: solo las entradas dibujadas, con sus colores y estilos reales.
  return (
    <div className="legend" data-legend="google">
      {items.map((it) => {
        const Icon = ICONS[it.key];
        return (
          <div className="legend-item" key={it.key} data-legend-key={it.key}>
            {it.type === 'line'
              ? <LineSwatch color={it.color} dashed={it.dashed} />
              : <div className={`legend-swatch ${it.key}`} style={{ background: it.color }}>{Icon && <Icon />}</div>}
            <span className="label">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
