import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function RequireRole({ role, children }) {
  const { user, checking } = useAuth();
  if (checking) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div role="alert" className="max-w-sm rounded-xl bg-white p-6 text-center shadow">
          <h1 className="text-lg font-semibold text-slate-900">Acceso denegado</h1>
          <p className="mt-2 text-sm text-slate-600">Acceso denegado: esta vista es solo para conductores.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-[#2563EB] underline">Volver al inicio</Link>
        </div>
      </main>
    );
  }
  return children;
}
