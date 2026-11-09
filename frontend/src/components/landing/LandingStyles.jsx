// UH16 #219: estilos propios de la landing. Van aqui (y no en index.css) para no tocar estilos globales.
// prefers-reduced-motion: reduce apaga todas las animaciones y transiciones dentro de .pupi-motion.
const CSS = `
@keyframes pupi-press { 0% { transform: scale(1); } 40% { transform: scale(0.9); } 100% { transform: scale(1.06); } }
@keyframes pupi-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pupi-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes pupi-dialog-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes pupi-dialog-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.96); } }

/* Encabezado: panel de vidrio esmerilado */
.pupi-glass {
  background: rgba(255, 255, 255, 0.55);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 50px rgba(16, 25, 43, 0.25);
}

/* Boton GO */
.pupi-go {
  background: rgba(16, 25, 43, 0.42);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(16, 25, 43, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.pupi-go[data-phase="pressing"] { animation: pupi-press 0.26s ease-out forwards; }
.pupi-go-ring { transition: opacity 0.2s ease; }
.pupi-go-ring[data-visible="false"] { opacity: 0; }
.pupi-go-ring[data-visible="true"] { opacity: 1; }

/* Carrusel: sin barra de desplazamiento; el dedo, las flechas y el teclado siguen funcionando */
.pupi-track { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
.pupi-track::-webkit-scrollbar { display: none; width: 0; height: 0; }
.pupi-slide { transition: opacity 0.35s ease, transform 0.35s ease; }
.pupi-slide[data-active="false"] { opacity: 0.6; transform: scale(0.97); }
.pupi-arrow { transition: opacity 0.2s ease, transform 0.2s ease; }
.pupi-arrow[data-visible="false"] { opacity: 0; pointer-events: none; transform: translateY(-50%) scale(0.9); }
.pupi-arrow[data-visible="true"] { opacity: 1; transform: translateY(-50%) scale(1); }

/* Detalle (Ampliar) */
.pupi-backdrop {
  background: rgba(16, 25, 43, 0.55);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  animation: pupi-fade-in 0.25s ease-out;
}
.pupi-backdrop[data-state="closing"] { animation: pupi-fade-out 0.2s ease-in forwards; }
.pupi-dialog {
  width: min(92vw, 1200px);
  height: min(88vh, 900px);
  height: min(88dvh, 900px);
  display: flex;
  flex-direction: column;
  animation: pupi-dialog-in 0.25s ease-out;
}
.pupi-dialog[data-state="closing"] { animation: pupi-dialog-out 0.2s ease-in forwards; }
.pupi-dialog-media { flex: 0 0 38%; min-height: 0; }
.pupi-dialog-body { flex: 1 1 auto; min-height: 0; min-width: 0; }
@media (orientation: landscape) {
  .pupi-dialog { flex-direction: row; }
  .pupi-dialog-media { flex: 0 0 44%; height: 100%; }
}

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
