import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DriverPage from './pages/DriverPage';
import StudentPage from './pages/StudentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentPage />} />
        <Route path="/conductor" element={<DriverPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
