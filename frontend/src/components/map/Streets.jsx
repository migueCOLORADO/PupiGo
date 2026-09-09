import { DESKTOP, MOBILE } from './geometry';

const Block = (p) => <rect rx={p.rx ?? 6} fill="var(--map-block)" {...p} />;
const Road = (p) => <line stroke="var(--map-road)" {...p} />;

export function DesktopStreets({ svgRef, pathRef }) {
  const G = DESKTOP;
  return (
    <svg ref={svgRef} className="streets" viewBox={G.viewBox} preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="900" height="620" fill="var(--map-land)" />
      <ellipse cx="120" cy="70" rx="90" ry="45" fill="var(--map-park)" />
      <Block x="40" y="180" width="70" height="46" /><Block x="120" y="200" width="55" height="58" />
      <Block x="30" y="270" width="60" height="50" /><Block x="330" y="60" width="80" height="50" />
      <Block x="420" y="40" width="60" height="45" /><Block x="620" y="40" width="70" height="55" />
      <Block x="700" y="200" width="75" height="55" /><Block x="780" y="280" width="65" height="60" />
      <Block x="250" y="380" width="80" height="55" /><Block x="400" y="420" width="70" height="50" />
      <Block x="560" y="380" width="75" height="55" /><Block x="700" y="440" width="70" height="50" />
      <Road x1="0" y1="120" x2="900" y2="150" strokeWidth="9" />
      <Road x1="0" y1="360" x2="900" y2="330" strokeWidth="12" />
      <Road x1="150" y1="0" x2="190" y2="620" strokeWidth="7" />
      <Road x1="560" y1="0" x2="600" y2="620" strokeWidth="9" />
      <Road x1="0" y1="470" x2="900" y2="450" strokeWidth="6" />
      <path d={G.river} stroke="var(--map-river)" strokeWidth="18" fill="none" />
      <text className="street-label river" x="20" y="605">Río Medellín</text>
      <text className="street-label minor" x="30" y="115">Cl. 10 Sur</text>
      <text className="street-label minor" x="600" y="30">Cra. 43A</text>
      <path d={G.hwy} stroke="var(--map-hwy)" strokeWidth="22" fill="none" />
      <path d={G.hwy} className="hwy-center" />
      <text className="street-label" x="560" y="200" transform="rotate(-18 560 200)">Av. Regional</text>
      <path className="route-path-bg" d={G.route} />
      <path ref={pathRef} className="route-path" d={G.route} />
    </svg>
  );
}

export function MobileStreets({ svgRef, pathRef }) {
  const G = MOBILE;
  return (
    <svg ref={svgRef} className="streets" viewBox={G.viewBox} preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="400" height="420" fill="var(--map-land)" />
      <ellipse cx="50" cy="35" rx="45" ry="25" fill="var(--map-park)" />
      <Block rx={5} x="10" y="140" width="40" height="30" /><Block rx={5} x="200" y="30" width="45" height="30" />
      <Block rx={5} x="300" y="60" width="40" height="35" /><Block rx={5} x="130" y="260" width="40" height="35" />
      <Block rx={5} x="250" y="300" width="45" height="30" />
      <Road x1="0" y1="90" x2="400" y2="100" strokeWidth="7" />
      <Road x1="0" y1="230" x2="400" y2="210" strokeWidth="9" />
      <Road x1="70" y1="0" x2="90" y2="420" strokeWidth="6" />
      <path d={G.river} stroke="var(--map-river)" strokeWidth="13" fill="none" />
      <path d={G.hwy} stroke="var(--map-hwy)" strokeWidth="16" fill="none" />
      <path d={G.hwy} className="hwy-center" />
      <path className="route-path-bg" d={G.route} />
      <path ref={pathRef} className="route-path" d={G.route} />
    </svg>
  );
}
