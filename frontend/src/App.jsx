import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import DriverAuthPage from './pages/DriverAuthPage';
import DriverPage from './pages/DriverPage';
import RoleSelectPage from './pages/RoleSelectPage';
import StudentPage from './pages/StudentPage';

// LandingPage la aporta la Feature 16; si aun no existe en la rama, "/" va a la seleccion de rol.
const landing = import.meta.glob('./pages/LandingPage.jsx', { eager: true });
const LandingPage = landing['./pages/LandingPage.jsx']?.default;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={LandingPage ? <LandingPage /> : <Navigate to="/auth0" replace />} />
          <Route path="/auth0" element={<RoleSelectPage />} />
          <Route path="/auth0-cond" element={<DriverAuthPage />} />
          <Route path="/estudiante" element={<StudentPage />} />
          <Route path="/conductor" element={<DriverPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
