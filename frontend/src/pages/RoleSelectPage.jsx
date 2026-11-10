import { useNavigate } from 'react-router-dom';
import HeroBackdrop from '../components/landing/HeroBackdrop';
import heroImage from '../assets/landing/fondoPrincipal.jpg';
import logo from '../assets/logo.png';

const btn = 'w-full rounded-xl px-5 py-3 text-base font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2';

// UH17 / RF #227: seleccion de rol en /auth0, con el mismo fondo y panel de vidrio del encabezado de la landing.
export default function RoleSelectPage() {
  const navigate = useNavigate();
  return (
    <HeroBackdrop as="main" image={heroImage} className="font-sans" panelClassName="max-w-md">
      <span className="rounded-2xl bg-white px-4 py-2 shadow-card">
        <img src={logo} alt="PupiGo" className="h-12 w-auto brightness-[1.04] md:h-14" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-ink md:text-3xl">¿Quién eres?</h1>
      <div className="mt-8 flex w-full flex-col gap-3">
        <button type="button" onClick={() => navigate('/estudiante')}
          className={`${btn} bg-[#2563EB] text-white hover:bg-[#1d4ed8]`}>
          Soy Eafitense
        </button>
        <button type="button" onClick={() => navigate('/auth0-cond')}
          className={`${btn} bg-white text-[#2563EB] ring-1 ring-[#2563EB] hover:bg-blue-50`}>
          Soy Pupichofer
        </button>
      </div>
    </HeroBackdrop>
  );
}
