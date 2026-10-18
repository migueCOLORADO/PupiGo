import { useState } from 'react';
import AppShell from '../components/AppShell';
import DriverPanel from '../components/DriverPanel';
import { useActiveTrip } from '../hooks/useActiveTrip';

export default function DriverPage() {
  const { trip, refresh } = useActiveTrip();
  const [pending, setPending] = useState('ida'); // direccion elegida antes de crear el recorrido
  const direction = trip?.direction || pending;
  return (
    <AppShell trip={trip} direction={direction} onDirectionChange={setPending} canToggle={!trip}
      panel={(compact) => (
        <DriverPanel trip={trip} refresh={refresh} direction={direction} onDirectionChange={setPending} compact={compact} />
      )} />
  );
}
