# UH9 - Identidad de marca e interfaz usable (Feature 9, #111)

Responsable: Daniel Mauricio Giraldo Moreno (dani-g11). Entrega de apoyo para Corporate Image (#158, Miguel).

## Slogan oficial

"Menos espera, mas certeza."

Visible junto al logo en el topbar de escritorio, tablet y movil, y al pie de los paneles de estudiante y conductor.

## Logo

Se conserva el logo actual (`frontend/src/assets/logo.png`). No se rediseña; se ubica en el topbar de ambas vistas (`/` y `/conductor`) y en los tres breakpoints.

## Paleta de colores

Evolucion del azul de marca. Primario azul + acento ambar + rojo de peligro + neutros. Texto con contraste AA. Los colores del mapa ilustrado (`--map-*`) no se modifican.

| Rol | Nombre | Hex | Uso |
|---|---|---|---|
| Primario | PupiGo Blue | `#2563EB` | marca, botones primarios, ruta, acciones |
| Primario oscuro | PupiGo Blue Dark | `#1D4ED8` | hover, gradiente de card primaria |
| Primario tenue | Blue 50 | `#EFF6FF` | fondos de iconos y estados informativos |
| Acento | Pupi Amber | `#F6A609` | estado "en espera", badges, detalles de marca |
| Acento oscuro | Amber Dark | `#B45309` | texto sobre fondos ambar tenues (contraste AA) |
| Acento tenue | Amber 50 | `#FEF3DD` | fondos suaves de aviso y ayuda |
| Exito | Green | `#16A34A` | "en vivo", confirmaciones (se conserva) |
| Peligro | Alert Red | `#DC2626` | errores con recuperacion |
| Peligro tenue | Red 50 | `#FEECEC` | fondo de alertas de error |
| Tinta | Ink | `#10192B` | texto principal, pin EAFIT |
| Neutros | Gray 25-500 | `#FAFBFC` a `#6B7280` | fondos, bordes, texto secundario (se conservan) |

Racional del acento: el ambar conecta con el dorado del mapa (`--map-hwy #F6C875`) sin competir con el azul. Se reserva para el estado "en espera" y detalles de marca; no se usa para texto largo (se aplica sobre fondos tenues o como relleno de iconos para mantener AA).

Los tokens viven en `frontend/src/index.css` (`:root`) y se espejan en `frontend/tailwind.config.js` (`theme.extend.colors`).

## Cumplimiento de requisitos

| Issue | Requisito | Donde y como se cumple |
|---|---|---|
| #113 | RF: Mostrar logo, slogan y paleta de PupiGo en las interfaces | Logo en el topbar (`TopBar.jsx`). Slogan "Menos espera, mas certeza." via `BrandSlogan.jsx` en el topbar y `BrandFoot` al pie de `StudentPanel.jsx` y `DriverPanel.jsx`. Paleta aplicada por tokens en `index.css` y `tailwind.config.js`; se propaga a todo el chrome sin reescribir componentes. |
| #114 | RF: Mostrar mensajes de error y estados excepcionales con accion de recuperacion | Componente `Uh9Alert.jsx` (mensaje + boton de recuperacion). Conductor: permiso GPS rechazado ofrece "Recargar pagina"; error de accion de recorrido ofrece "Reintentar". Estudiante: fallo de red de `useActiveTrip` (via prop `error`/`onRetry` en `StudentPanel.jsx`) ofrece "Reintentar". |
| #115 | RF: Ofrecer ayuda contextual sobre los estados del recorrido | Componente `StatusHelp.jsx`: popover accesible junto al chip de estado en ambas vistas, con descripcion y accion sugerida por estado (sin recorrido, en espera, en curso, completado, cancelado). Refuerza la `info-note` existente. |
| #116 | NFR: Usabilidad segun heuristicas de Nielsen | Visibilidad del estado (`StatusChip` con `role="status"` y `aria-live`, pill "en vivo"). Prevencion y recuperacion de errores (#114). Ayuda y documentacion (#115). Consistencia (tokens unicos de color y componentes reutilizados). Control del usuario (cierre de popover con Escape y click fuera). Foco visible (`:focus-visible` en controles nuevos). Lenguaje claro en espanol. |
| #117 | NFR: Diseno responsivo | Se respetan los tres breakpoints de `AppShell.jsx` (movil bottom-sheet < 768, tablet 768-1023, escritorio >= 1024 con 74/26). Los componentes nuevos (`Uh9Alert`, `StatusHelp`, slogan y footer) se adaptan a las tres variantes; el slogan movil aparece desde 420px. |

## Archivos

Nuevos: `components/Uh9Alert.jsx`, `components/StatusHelp.jsx`, `components/BrandSlogan.jsx`, `UH9_identidad_marca_interfaz.md`.

Modificados (cambio minimo): `src/index.css` (tokens + clases `uh9-`), `tailwind.config.js` (tokens espejo), `components/TopBar.jsx` (slogan), `components/StudentPanel.jsx` (ayuda, error, footer), `components/DriverPanel.jsx` (ayuda, error con recuperacion, footer), `components/StatusChip.jsx` (aria), `pages/StudentPage.jsx` (pasa error y refresh).

No se toco: `components/map/*`, tokens de color del mapa (`--map-*`), `README.md`, wiki, Project, `main`.

## Pendientes / sin verificar

- Capturas de `/` y `/conductor` en escritorio y movil: se comparten por el grupo, no al repo.
- Validacion de contraste AA hecha por calculo de ratio sobre los pares de color definidos; no se corrio una auditoria automatica (axe/Lighthouse).
- La ayuda contextual y los estados de error se probaron en navegador manualmente; no se agregaron pruebas automatizadas de UI (el proyecto no tiene suite de front).
