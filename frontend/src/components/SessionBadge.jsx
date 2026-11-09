import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function SessionBadge() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const box = 'fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs shadow-lg ring-1 ring-slate-200';

  if (!user) {
    return <Link to="/login" className={`${box} font-medium text-[#2563EB]`}>Iniciar sesion</Link>;
  }
  const out = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  return (
    <div className={box}>
      <span className="text-slate-700">{user.username} · {user.role}</span>
      <button type="button" onClick={out} className="font-medium text-[#2563EB] underline">Cerrar sesion</button>
    </div>
  );
}
