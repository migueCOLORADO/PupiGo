// UH16 #219: estilos propios de la landing. Van aqui (y no en index.css) para no tocar estilos globales.
// prefers-reduced-motion: reduce apaga las animaciones y transiciones dentro de .pupi-motion, salvo las
// marcadas con .pupi-keep-motion (el fundido corto de GO). El anillo del hover se dibuja por JS y sigue activo.
const CSS = `
@keyframes pupi-press { 0% { transform: scale(1); } 40% { transform: scale(0.9); } 100% { transform: scale(1.06); } }
@keyframes pupi-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pupi-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes pupi-dialog-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes pupi-dialog-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.96); } }
@keyframes pupi-wave { from { opacity: 0.85; transform: scale(1); } to { opacity: 0; transform: scale(2.3); } }
@keyframes pupi-zoom-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.92); } }
@keyframes pupi-veil-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes pupi-bg-in { from { filter: blur(12px); transform: scale(1.092); } to { filter: blur(3px); transform: scale(1.05); } }
@keyframes pupi-panel-in { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }

/* Transicion de GO: velo negro, alejamiento del encabezado y entrada desde negro */
.pupi-veil { opacity: 0; transition: opacity var(--pupi-veil-ms, 200ms) ease-in; }
.pupi-hero[data-exit="fade"] .pupi-veil { opacity: 1; }
.pupi-hero[data-exit="zoom"] .pupi-veil { --pupi-veil-ms: 500ms; opacity: 1; }
.pupi-hero[data-exit="zoom"] .pupi-hero-stage { animation: pupi-zoom-out 0.5s ease-in forwards; transform-origin: 50% 50vh; }
.pupi-hero[data-enter="go"] .pupi-veil { animation: pupi-veil-out 0.7s ease-out both; }
.pupi-hero[data-enter="go"] .pupi-hero-bg { animation: pupi-bg-in 0.7s ease-out both; }
.pupi-hero[data-enter="go"] .pupi-hero-panel { animation: pupi-panel-in 0.7s ease-out both; }

/* Paso suave del encabezado al fondo de "Conoce PupiGo" (gray-25), sin linea visible */
.pupi-hero-fade {
  background: linear-gradient(to bottom,
    rgba(250, 251, 252, 0) 0%, rgba(250, 251, 252, 0.03) 12%, rgba(250, 251, 252, 0.1) 25%,
    rgba(250, 251, 252, 0.22) 37%, rgba(250, 251, 252, 0.38) 50%, rgba(250, 251, 252, 0.56) 62%,
    rgba(250, 251, 252, 0.74) 75%, rgba(250, 251, 252, 0.9) 87%, rgb(250, 251, 252) 100%);
}

/* Encabezado sin caja: texto blanco con sombra suave sobre un velo radial oscuro leve */
.pupi-clear { position: relative; isolation: isolate; }
.pupi-clear::before {
  content: "";
  position: absolute;
  inset: -12% -18%;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(10, 15, 28, var(--pupi-veil-a, 0.35)) 0%, rgba(10, 15, 28, calc(var(--pupi-veil-a, 0.35) * 0.75)) 55%, rgba(10, 15, 28, 0) 100%);
}
.pupi-text-shadow { text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.25); }

/* Barra superior */
.pupi-topbar-link {
  background: rgba(16, 25, 43, 0.45);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

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
.pupi-go[data-phase="rings"], .pupi-go[data-phase="zoom"] { animation: pupi-press 0.26s ease-out forwards; }
.pupi-go-wave {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.35);
  pointer-events: none;
  opacity: 0;
  animation: pupi-wave 0.32s ease-out forwards;
}
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
/* Foto horizontal: arriba a todo el ancho con su proporcion (hasta la mitad del alto; el resto, fondo desenfocado) */
.pupi-dialog[data-layout="top"] { flex-direction: column; }
.pupi-dialog[data-layout="top"] .pupi-dialog-media { flex: 0 0 auto; width: 100%; height: auto; max-height: 50%; }

@media (prefers-reduced-motion: reduce) {
  .pupi-motion *:not(.pupi-keep-motion), .pupi-motion *::before, .pupi-motion *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

export default function LandingStyles() {
  return <style>{CSS}</style>;
}
