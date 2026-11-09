import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequireRole from '../auth/RequireRole';
import { useAuth } from '../auth/useAuth';
import AppShell from '../components/AppShell';
import DriverPanel from '../components/DriverPanel';
import { useActiveTrip } from '../hooks/useActiveTrip';

function ExitButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const exit = async () => {
    setBusy(true);
    await logout();
    navigate('/auth0', { replace: true });
  };
  return (
    <button type="button" onClick={exit} disabled={busy}
      className="fixed bottom-3 right-3 z-50 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2563EB] shadow-lg ring-1 ring-slate-200 disabled:opacity-60">
      Salir
    </button>
  );
}

function DriverView() {
  const { trip, refresh } = useActiveTrip();
  const [pending, setPending] = useState('ida'); // direccion elegida antes de crear el recorrido
  const direction = trip?.direction || pending;
  return (
    <>
      <AppShell trip={trip} direction={direction} onDirectionChange={setPending} canToggle={!trip}
        panel={(compact) => (
          <DriverPanel trip={trip} refresh={refresh} direction={direction} onDirectionChange={setPending} compact={compact} />
        )} />
      <ExitButton />
    </>
  );
}

// UH17: la proteccion vive aqui; sin conductor verificado se redirige a /auth0-cond.
export default function DriverPage() {
  return (
    <RequireRole role="conductor" redirectTo="/auth0-cond">
      <DriverView />
    </RequireRole>
  );
}
