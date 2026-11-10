import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import HeroBackdrop from '../components/landing/HeroBackdrop';
import visionImage from '../assets/landing/nuestraVision.jpg';

const GENERIC_ERROR = 'Usuario o contraseña incorrectos.';

// UH17: verificacion del conductor en /auth0-cond con el login por token de la Feature 12.
// Mismo fondo desenfocado y panel de vidrio del encabezado de la landing (HeroBackdrop).
export default function DriverAuthPage() {
  const { user, checking, login, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!checking && !busy && user?.role === 'conductor') return <Navigate to="/conductor" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(username.trim(), password);
      if (u.role !== 'conductor') {
        // un estudiante tampoco entra: se descarta su sesion y se muestra el mismo mensaje
        await logout();
        throw new Error('rol');
      }
      navigate('/conductor', { replace: true });
    } catch {
      setPassword('');
      setError(GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#2563EB]';
  return (
    <HeroBackdrop as="main" image={visionImage} className="font-sans" panelClassName="max-w-sm !items-stretch !text-left">
      <form onSubmit={submit} className="w-full">
        <h1 className="text-center text-xl font-semibold text-ink md:text-2xl">Verifica tu identidad</h1>
        <label className="mt-4 block text-sm font-medium text-slate-800">Usuario
          <input className={field} value={username} onChange={(e) => setUsername(e.target.value)}
            autoComplete="username" required />
        </label>
        <label className="mt-3 block text-sm font-medium text-slate-800">Contraseña
          <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" required />
        </label>
        {error && <p role="alert" className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" disabled={busy}
          className="mt-5 w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-60">
          {busy ? 'Verificando...' : 'Verificar identidad'}
        </button>
        <Link to="/auth0" className="mt-4 block text-center text-sm font-medium text-slate-800 underline">Volver</Link>
      </form>
    </HeroBackdrop>
  );
}
