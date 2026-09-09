/* Iconos SVG copiados del mockup. */
const S = ({ children, sw = 2.3, stroke = 'white', join = true, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
    strokeLinejoin={join ? 'round' : undefined} {...rest}>{children}</svg>
);

export const IconPinLoc = () => (
  <S width="14" height="14" stroke="#6B7280" sw={2.4} join={false}>
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.3" />
  </S>
);
export const IconPlus = (p) => <S stroke="currentColor" sw={2.6} join={false} {...p}><path d="M12 3v18M3 12h18" /></S>;
export const IconMinus = (p) => <S stroke="currentColor" sw={2.6} join={false} {...p}><path d="M3 12h18" /></S>;
export const IconNav = (p) => <S stroke="currentColor" sw={2.3} {...p}><path d="M3 11l18-8-8 18-2-8-8-2z" /></S>;
export const IconCompass = () => (
  <S width="16" height="16" stroke="#2563EB" sw={2.2}>
    <path d="M12 2l3 9-3 2-3-2 3-9z" fill="#2563EB" stroke="none" /><path d="M12 22V13" />
  </S>
);

export const PinMetro = ({ simple }) => (
  <S>
    <rect x="4" y="4" width="16" height="14" rx="4" />
    {!simple && <><circle cx="8.5" cy="15" r="1.2" fill="white" stroke="none" /><circle cx="15.5" cy="15" r="1.2" fill="white" stroke="none" /></>}
    <line x1="4" y1="10" x2="20" y2="10" />
  </S>
);
export const PinStop = ({ simple }) => (
  <S sw={2.4}><rect x="3" y="6" width="18" height="10" rx="2" />{!simple && <line x1="3" y1="11" x2="21" y2="11" />}</S>
);
export const PinEafit = ({ simple }) => simple
  ? <S><path d="M4 9l8-4 8 4M6 12v6M18 12v6" /></S>
  : <S><rect x="4" y="9" width="16" height="3" rx="1.5" /><path d="M6 12v6M18 12v6M9 12v6M15 12v6" /><path d="M4 9l8-4 8 4" /></S>;
export const IconBus = ({ simple }) => (
  <S sw={simple ? 2.4 : 2.3}>
    <rect x="3" y="5" width="18" height="12" rx="3" />
    {!simple && <><circle cx="7.5" cy="19" r="1.5" fill="white" stroke="none" /><circle cx="16.5" cy="19" r="1.5" fill="white" stroke="none" /></>}
    <line x1="3" y1="10" x2="21" y2="10" />
  </S>
);

export const LegendBus = () => <S sw={2.4} join={false}><rect x="3" y="5" width="18" height="12" rx="3" /><line x1="3" y1="10" x2="21" y2="10" /></S>;
export const LegendMetro = () => <S sw={2.4} join={false}><rect x="4" y="4" width="16" height="14" rx="4" /></S>;
export const LegendStop = () => <S sw={2.4} join={false}><rect x="3" y="6" width="18" height="10" rx="2" /></S>;
export const LegendEafit = () => <S sw={2.4} join={false}><path d="M4 9l8-4 8 4" /></S>;

export const IconClock = () => <S stroke="currentColor" sw={2.2}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></S>;
export const IconRefresh = () => <S stroke="currentColor" sw={2.2}><path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" /></S>;
export const IconInfo = () => (
  <S stroke="currentColor" sw={2.2}>
    <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12.5" /><circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
  </S>
);
export const DirArrow = ({ flipped, sw = 2.4 }) => (
  <S className="dir-arrow" sw={sw} style={{ transform: flipped ? 'scaleX(-1)' : 'scaleX(1)' }}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
  </S>
);
