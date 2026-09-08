import logo from '../assets/logo.png';
import DirToggle from './DirToggle';

export function TopBar({ trip, direction, onDirectionChange, canToggle }) {
  const live = trip?.status === 'in_progress';
  return (
    <div className="topbar">
      <div className="brand">
        <img className="logo" src={logo} alt="PupiGo" />
        <div className="brand-text"><p>Seguimiento en tiempo real</p></div>
      </div>
      <div className="topbar-right">
        <DirToggle direction={direction} onChange={onDirectionChange} disabled={!canToggle} />
        <div className={`live-pill${live ? '' : ' off'}`}><span className="pulse" />{live ? 'En vivo' : 'Sin señal'}</div>
      </div>
    </div>
  );
}

export function MobileTopBar({ trip, direction, onDirectionChange, canToggle }) {
  const live = trip?.status === 'in_progress';
  return (
    <>
      <div className="m-topbar">
        <div className="m-brand"><img className="logo" src={logo} alt="PupiGo" /></div>
        <div className={`m-live${live ? '' : ' off'}`}><span className="pulse" />{live ? 'En vivo' : 'Sin señal'}</div>
      </div>
      <div className="px-[18px] pb-[10px]">
        <DirToggle mobile direction={direction} onChange={onDirectionChange} disabled={!canToggle} />
      </div>
    </>
  );
}
