# PupiGo — Contexto para v1 del proyecto (Sprint 2)

## Stack requerido

- **Backend**: Django (API REST, usar Django REST Framework)
- **Frontend**: React
- **Estilos/animaciones/transiciones**: Bootstrap o Tailwind CSS (elegir uno, ser consistente)
- **Responsive**: obligatorio. La app debe verse y funcionar correctamente en cualquier ancho de pantalla y dispositivo (desktop, tablet, mobile), replicando el comportamiento ya definido en el mockup (`pupigo-mockup.html`), que contempla explícitamente variantes desktop (Chrome/Safari/Edge), tablet (iPad) y mobile (Android/iPhone).

## Fidelidad al mockup — Mapa

El mockup (`/mnt/project/pupigo-mockup.html`) ya define el diseño visual del mapa. **Debe conservarse tal cual**, no rediseñar:

- Mapa dibujado como **SVG custom estilo Google Maps** (no usar Leaflet/Google Maps API real todavía — el alcance visual es el mismo mapa ilustrado del mockup: calles, avenida principal, río, ruta con línea punteada animada en movimiento).
- Paleta de mapa: fondo tipo terreno (`--map-land: #F3F1EA`), calles blancas, vía principal en dorado (`--map-hwy: #F6C875`), río en celeste (`--map-river: #AEE1F0`).
- Ruta trazada con `path` SVG con animación de guiones en movimiento (`stroke-dasharray` + `dash-move` keyframe), color azul (`--blue: #2563EB`).
- Marcadores tipo pin (forma gota, `border-radius: 50% 50% 50% 4px`, rotado 45°) para origen/destino, con colores distintos: EAFIT en tinta oscura (`--ink`), Metro en azul, paradas intermedias en teal (`#0EA5A5`).
- Marcador del colectivo: círculo azul central con anillo de pulso animado (`bus-pulse` keyframe), simulando "en vivo".
- Overlay flotante sobre el mapa: badge de ubicación (esquina superior izquierda), chip "En vivo" (esquina inferior izquierda, con punto pulsante verde), controles de zoom/brújula (esquina superior derecha).
- Selector de dirección **Metro → EAFIT / EAFIT → Metro** en el topbar (toggle de dos botones), que invierte los marcadores de origen/destino y mueve el marcador del colectivo.
- Layout desktop: columna de mapa ocupa 74% del ancho, columna lateral (side panel) 26%, separadas por borde. En mobile, el mapa pasa a ocupar el ancho completo con panel inferior/colapsable (seguir el patrón ya resuelto en `.phone-shell` / `.app-mount-mobile` del mockup).
- Leyenda inferior del mapa (bajo el mapa, no dentro de él) con íconos: colectivo, EAFIT, Metro, parada, línea de ruta.

**Regla dura**: no cambiar la disposición visual, colores, ni comportamiento de estos elementos. Implementarlos con componentes React + SVG (o Canvas si se justifica), pero el resultado visual debe ser indistinguible del mockup.

## Alcance de datos para Sprint 2 (no confundir con Sprint 1 del mockup)

El mockup fue construido para el alcance de Sprint 1 (ruta fija Estación Aguacatala ↔ Entrada Las Hermosas, sin backend real). Para Sprint 2, el mapa debe consumir datos reales desde el backend Django (estado del recorrido, posición GPS, dirección), pero la ruta fija EAFIT–Metro y su representación visual se mantienen sin cambios.

---

## Features y User Histories comprometidas para Sprint 2

Origen: Gherkin de UH (issues del repo, Source=Feature/User History), 5 UH mínimas por regla del profesor (5 integrantes).

### UH1 — Gestionar recorrido y compartir ubicación (Feature 1)
**Como** conductor, **quiero** gestionar un recorrido y compartir su ubicación **para que** los estudiantes puedan conocer el estado y la ubicación actual del colectivo.

Escenarios:
- Iniciar un recorrido → estado pasa a "En curso", comienza a compartir GPS.
- Poner un recorrido en espera antes de iniciar → estado "En espera", estudiantes tienen tiempo para abordar (~15 min).
- Iniciar el recorrido después del tiempo de espera → estado "En curso", continúa compartiendo GPS.
- Finalizar un recorrido → estado "Completado", detiene seguimiento activo.

RF/NFR asociados:
- **RF-04**: Registrar recorrido asociado a ruta, vehículo y conductor.
- **RF-05**: Actualizar estado de ruta a "en curso" al iniciar.
- **RF-19**: Actualizar estado de recorrido a cancelado/completado.

Size: L (8 pts) — Sprint 2

---

### UH2 — Visualizar estado y ubicación del colectivo (Feature 2)
**Como** estudiante, **quiero** visualizar el estado y la ubicación actual del colectivo **para** decidir si debo esperar por él o usar otra opción de transporte.

Escenarios:
- Visualizar un colectivo en curso → mostrar ubicación actual + estado del recorrido.
- Visualizar un colectivo en espera → indicar que está esperando, aún no ha comenzado.

RF/NFR asociados:
- **RF-06**: Mostrar ubicación en vivo del conductor.
- **RF-07**: Mostrar ubicación del vehículo en mapa interactivo.

Size: M (5 pts) — Sprint 2

---

### UH3 — Actualización periódica de ubicación GPS (Feature 3)
**Como** estudiante, **quiero** que la ubicación del colectivo se actualice periódicamente **para que** la posición mostrada en el mapa sea lo más precisa posible.

Escenarios:
- Compartir la ubicación GPS del colectivo → enviar lat/long/timestamp al obtener nueva posición.
- Actualizar automáticamente la posición del colectivo → refresco automático, disponible para estudiantes.
- Cumplir con la latencia máxima de actualización GPS → nueva posición disponible dentro de la latencia máxima definida.

RF/NFR asociados:
- **RF-06b**: Ubicación en vivo aplicada al ciclo de actualización periódica.
- **NFR-Latencia GPS**: intervalo máximo de 15 segundos entre lecturas durante todo el recorrido activo.

Size: L (8 pts) — Sprint 2

---

### UH5 — Gestionar permisos de ubicación GPS (Feature 5)
El sistema debe gestionar el rechazo de los permisos de ubicación GPS.

Escenarios:
- El conductor concede el permiso GPS → sistema obtiene ubicación, comienza a compartir cuando el recorrido esté activo.
- El conductor rechaza el permiso GPS → sistema informa que el permiso es necesario, no intenta compartir sin permiso.

RF/NFR asociados:
- **NFR-Manejo de errores GPS**: notificar de forma clara el rechazo del permiso, sin fallar silenciosamente.

Size: S (3 pts) — Sprint 2

---

### UH8 — Cancelar un recorrido (Feature 8)
**Como** conductor, **quiero** cancelar un recorrido **para que** los estudiantes no vean como activo un recorrido que no podrá completarse.

Escenarios:
- Cancelar un recorrido en espera → estado "Cancelado", ya no se ve como ruta activa.
- Cancelar un recorrido en curso → estado "Cancelado", se detiene envío activo de ubicación, estudiantes informados.

RF/NFR asociados:
- **RF-19b**: Actualizar recorrido a cancelado (activo o en espera).

Size: M (5 pts) — Sprint 2

---

**Total Sprint 2**: 5 UH, 29 story points.

> UH4 (última posición conocida), UH6 (visualización de ruta) y UH7 (dirección del colectivo) quedan diferidas a Sprint 3 — no forman parte del alcance de esta v1.

---

## Estados del recorrido (máquina de estados a implementar en backend)

```
En espera → En curso → Completado
En espera → Cancelado
En curso  → Cancelado
```

- **En espera**: conductor en punto de salida, recorrido aún no inicia. Duración configurable (~15 min).
- **En curso**: recorrido iniciado, GPS activo compartiéndose.
- **Completado**: conductor llegó al destino y confirmó.
- **Cancelado**: conductor canceló, sistema deja de tratarlo como ruta activa.

## Consideraciones técnicas adicionales

- Backend Django debe exponer endpoints REST para: iniciar/poner en espera/cancelar/finalizar recorrido, recibir posición GPS (lat, long, timestamp), consultar estado y última posición conocida de un recorrido activo.
- Frontend React debe consumir estos endpoints con polling o WebSockets (a criterio de Claude Code, documentar la elección) respetando la latencia máxima definida (15 seg) para actualización de posición.
- Manejo de permiso de geolocalización del navegador (`navigator.geolocation`) en el rol conductor, con feedback visual claro si se rechaza.
- Diseño mobile-first o al menos totalmente adaptable: probar en anchos de mobile, tablet y desktop tal como lo hace el propio mockup con sus distintos frames.
