const OPTS = [['ida', 'Metro → EAFIT'], ['vuelta', 'EAFIT → Metro']];

export default function DirToggle({ direction, onChange, disabled, mobile }) {
  return (
    <div className={mobile ? 'm-dir-toggle' : 'dir-toggle'} role="radiogroup" aria-label="Dirección del recorrido">
      {OPTS.map(([k, label]) => (
        <button key={k} type="button" data-dir={k} role="radio" aria-checked={direction === k}
          className={direction === k ? 'active' : ''} disabled={disabled}
          onClick={() => !disabled && onChange?.(k)}>{label}</button>
      ))}
    </div>
  );
}
