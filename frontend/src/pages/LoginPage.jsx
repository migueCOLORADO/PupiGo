import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const home = (role) => (role === 'conductor' ? '/conductor' : '/');

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={home(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(username.trim(), password);
      navigate(home(u.role), { replace: true });
    } catch {
      // mensaje unico: no revela cual dato fue incorrecto
      setError('Usuario o contrasena incorrectos.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]';
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-slate-900">Iniciar sesion</h1>
        <label className="mt-4 block text-sm text-slate-700">Usuario
          <input className={field} value={username} onChange={(e) => setUsername(e.target.value)}
            autoComplete="username" required />
        </label>
        <label className="mt-3 block text-sm text-slate-700">Contrasena
          <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" required />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy}
          className="mt-5 w-full rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {busy ? 'Entrando...' : 'Entrar'}
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-slate-500 underline">Volver al mapa</Link>
      </form>
    </main>
  );
}
