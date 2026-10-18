import { LegendBus, LegendEafit, LegendMetro, LegendStop } from './icons';

const ITEMS = [
  ['bus', LegendBus, 'Pupi Bus'],
  ['metro', LegendMetro, 'Estación Aguacatala'],
  ['stop', LegendStop, 'Paradero La Aguacatala'],
  ['eafit', LegendEafit, 'Entrada Las Hermosas'],
];

export default function Legend() {
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
