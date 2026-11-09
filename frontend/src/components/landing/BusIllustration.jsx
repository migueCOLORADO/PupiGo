// UH16 #219: ilustracion SVG propia del colectivo en perspectiva (cara lateral, techo y frente)
// con el logo de PupiGo como calcomania. Ruedas, carretera y nubes animadas.
import logo from '../../assets/logo.png';

function Wheel({ cx }) {
  return (
    <g className="pupi-wheel">
      <circle cx={cx} cy="150" r="24" fill="#10192B" />
      <circle cx={cx} cy="150" r="13" fill="#9AA3B2" />
      <path d={`M${cx - 11} 150h22M${cx} 139v22`} stroke="#10192B" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy="150" r="4" fill="#E2E6EC" />
    </g>
  );
}

function Cloud({ x, y, s = 1, className }) {
  return (
    <g className={className}>
      <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" opacity="0.9">
        <ellipse cx="0" cy="0" rx="46" ry="18" />
        <ellipse cx="-22" cy="-10" rx="22" ry="16" />
        <ellipse cx="16" cy="-16" rx="26" ry="20" />
      </g>
    </g>
  );
}

export default function BusIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="img"
      aria-label="Ilustración del colectivo de PupiGo en la vía, con el logo de PupiGo como calcomanía"
    >
      <defs>
        <linearGradient id="pupi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="pupi-roof" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#93C5FD" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="pupi-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E40AF" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="pupi-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0F2FE" />
          <stop offset="1" stopColor="#93C5FD" />
        </linearGradient>
      </defs>

      <Cloud x={160} y={60} s={1} className="pupi-cloud" />
      <Cloud x={-120} y={110} s={0.7} className="pupi-cloud-slow" />
      <Cloud x={420} y={40} s={0.8} className="pupi-cloud-slow" />

      <path d="M0 200 C150 130 260 160 380 140 S620 100 760 140 S1000 110 1200 160 V245 H0Z" fill="#CFE3C2" />
      <path d="M0 225 C200 185 400 205 600 190 S950 175 1200 200 V245 H0Z" fill="#DCEBD2" />

      <rect x="0" y="238" width="1200" height="10" fill="#E2E6EC" />
      <rect x="0" y="248" width="1200" height="52" fill="#334155" />
      <path className="pupi-road" d="M0 276H1200" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="40 30" />

      <ellipse cx="603" cy="262" rx="205" ry="9" fill="#0F172A" opacity="0.35" />

      <g transform="translate(420 90)">
        <g className="pupi-bob">
          <polygon points="10,20 320,20 356,4 46,4" fill="url(#pupi-roof)" />
          <rect x="0" y="20" width="330" height="130" rx="12" fill="url(#pupi-body)" />
          <polygon points="330,26 366,10 366,136 330,150" fill="url(#pupi-front)" />
          <polygon points="334,36 362,24 362,74 334,86" fill="url(#pupi-glass)" />
          <polygon points="336,140 364,128 364,138 336,150" fill="#10192B" />
          <ellipse cx="356" cy="114" rx="5" ry="7" fill="#FDE68A" />

          {[18, 72, 126, 180, 234].map((x) => (
            <rect key={x} x={x} y="32" width="46" height="50" rx="6" fill="url(#pupi-glass)" />
          ))}
          <rect x="288" y="32" width="34" height="106" rx="4" fill="url(#pupi-glass)" />
          <path d="M305 34v102" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="0" y="90" width="288" height="8" fill="#F6A609" />

          <rect x="100" y="104" width="126" height="40" rx="8" fill="#FFFFFF" stroke="#F6A609" strokeWidth="2" />
          <image href={logo} x="104" y="107" width="118" height="34" preserveAspectRatio="xMidYMid meet" />

          <path d="M40 150 A30 30 0 0 1 100 150 Z" fill="#1E3A8A" />
          <path d="M230 150 A30 30 0 0 1 290 150 Z" fill="#1E3A8A" />
          <Wheel cx={70} />
          <Wheel cx={260} />
        </g>
      </g>
    </svg>
  );
}
