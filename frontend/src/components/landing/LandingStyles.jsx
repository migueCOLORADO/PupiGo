// UH16 #219: keyframes propios de la landing. Van aqui (y no en index.css) para no tocar estilos globales.
// prefers-reduced-motion: reduce apaga todas las animaciones y transiciones dentro de .pupi-motion.
const CSS = `
@keyframes pupi-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes pupi-spin { to { transform: rotate(360deg); } }
@keyframes pupi-road { to { stroke-dashoffset: -70; } }
@keyframes pupi-drift { from { transform: translateX(-260px); } to { transform: translateX(1460px); } }
@keyframes pupi-load { from { stroke-dashoffset: 302; } to { stroke-dashoffset: 0; } }
@keyframes pupi-pop { 0% { transform: scale(1); } 35% { transform: scale(0.88); } 100% { transform: scale(1.14); } }
@keyframes pupi-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes pupi-fade { from { opacity: 0; } to { opacity: 1; } }

.pupi-bob { animation: pupi-bob 1.6s ease-in-out infinite; }
.pupi-wheel { transform-box: fill-box; transform-origin: center; animation: pupi-spin 1.1s linear infinite; }
.pupi-road { animation: pupi-road 0.9s linear infinite; }
.pupi-cloud { animation: pupi-drift 48s linear infinite; }
.pupi-cloud-slow { animation: pupi-drift 70s linear infinite; animation-delay: -30s; }

.pupi-go-ring { opacity: 0; transform-box: fill-box; transform-origin: center; transition: opacity 0.2s ease; }
.pupi-go:hover .pupi-go-ring,
.pupi-go:focus-visible .pupi-go-ring { opacity: 1; animation: pupi-spin 0.9s linear infinite; }
.pupi-go-progress { opacity: 0; }
.pupi-go[data-phase="launching"] .pupi-go-ring { opacity: 0; animation: none; }
.pupi-go[data-phase="launching"] .pupi-go-progress { opacity: 1; animation: pupi-load 0.8s ease-out forwards; }
.pupi-go[data-phase="launching"] .pupi-go-core { animation: pupi-pop 0.8s ease-out forwards; }

.pupi-dialog { animation: pupi-in 0.22s ease-out; }
.pupi-backdrop { animation: pupi-fade 0.2s ease-out; }

.pupi-track { scrollbar-width: thin; -webkit-overflow-scrolling: touch; }

@media (prefers-reduced-motion: reduce) {
  .pupi-motion *, .pupi-motion *::before, .pupi-motion *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

export default function LandingStyles() {
  return <style>{CSS}</style>;
}
