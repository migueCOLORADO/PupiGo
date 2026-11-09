import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

// UH17: sin sesion del rol pedido (incluido un estudiante con sesion) redirige a la verificacion.
export default function RequireRole({ role, redirectTo = '/auth0-cond', children }) {
  const { user, checking } = useAuth();
  if (checking) return null;
  if (user?.role !== role) return <Navigate to={redirectTo} replace />;
  return children;
}
