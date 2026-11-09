import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const btn = 'w-full rounded-xl px-5 py-3 text-base font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2';

// UH17 / RF #227: seleccion de rol en /auth0.
export default function RoleSelectPage() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm text-center">
        <img src={logo} alt="PupiGo" className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">¿Quién eres?</h1>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={() => navigate('/estudiante')}
            className={`${btn} bg-[#2563EB] text-white hover:bg-[#1d4ed8]`}>
            Soy Eafitense
          </button>
          <button type="button" onClick={() => navigate('/auth0-cond')}
            className={`${btn} bg-white text-[#2563EB] ring-1 ring-[#2563EB] hover:bg-blue-50`}>
            Soy Pupichofer
          </button>
        </div>
      </div>
    </main>
  );
}
