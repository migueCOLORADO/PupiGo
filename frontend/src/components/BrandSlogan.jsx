// UH9 #113: slogan oficial de PupiGo, visible junto al logo.
export const SLOGAN = 'Menos espera, mas certeza.';

export default function BrandSlogan() {
  return <p className="uh9-slogan">Menos espera, <b>mas certeza.</b></p>;
}

// Microcopy de marca al pie del panel (refuerza identidad en ambas vistas).
export function BrandFoot() {
  return (
    <div className="uh9-brand-foot">
      <span>PupiGo</span><span className="dot" aria-hidden="true" /><span>{SLOGAN}</span>
    </div>
  );
}
