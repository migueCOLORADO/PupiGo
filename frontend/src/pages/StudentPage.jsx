import AppShell from '../components/AppShell';
import StudentPanel from '../components/StudentPanel';
import { useActiveTrip } from '../hooks/useActiveTrip';

export default function StudentPage() {
  const { trip, lastEnded, error, refresh } = useActiveTrip();
  return (
    <AppShell trip={trip} direction={trip?.direction || 'ida'} canToggle={false}
      panel={(compact, mobile) => <StudentPanel trip={trip} lastEnded={lastEnded} error={error} onRetry={refresh} compact={compact} mobile={mobile} />} />
  );
}
