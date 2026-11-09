import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import RequireRole from './auth/RequireRole';
import SessionBadge from './components/SessionBadge';
import DriverPage from './pages/DriverPage';
import LoginPage from './pages/LoginPage';
import StudentPage from './pages/StudentPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<StudentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/conductor" element={<RequireRole role="conductor"><DriverPage /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SessionBadge />
      </AuthProvider>
    </BrowserRouter>
  );
}
