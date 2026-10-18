# PupiGo — Sprint 3 · Feature 4 / UH4: Última posición conocida

> Documento de la UH4 para el Sprint 3. No modifica `CONTEXT_v1_Sprint2.md`, que describe el alcance del Sprint 2 (la UH4 estaba diferida a este sprint).

## Feature 4: Última posición conocida
El sistema debe conservar la última posición GPS conocida del colectivo. Contiene: UH4.

### UH4 — Conservar última posición GPS conocida

**Escenario 1 — Conservar la última posición conocida**
- Dado que el colectivo ha enviado previamente una posición GPS válida
- Cuando el sistema deja de recibir temporalmente nuevas posiciones GPS
- Entonces el sistema debe conservar la última posición conocida
- Y el estudiante debe continuar viendo la última posición conocida en el mapa.

**Escenario 2 — Recibir una nueva posición después de una interrupción temporal**
- Dado que el sistema está mostrando la última posición conocida
- Cuando se recibe una nueva posición GPS válida
- Entonces el sistema debe reemplazar la posición anterior por la nueva posición.

**NFR — Disponibilidad de datos ante interrupción GPS**
Si el mapa no recibe una nueva ubicación dentro del intervalo esperado, debe seguir mostrando la última posición conocida del colectivo en vez de vaciar el marcador.

---

## Implementación

### Backend (`backend/tracking/`)
- `models.py`: propiedad `Trip.position_age_seconds` (segundos desde que el servidor recibió la última lectura, usando `received_at`; `null` si aún no hay posiciones). La última posición ya se conservaba en BD (`Trip.last_position`).
- `serializers.py`: `TripSerializer` expone `position_age_seconds`. `PositionSerializer` valida `lat` en [-90, 90] y `lng` en [-180, 180]; una lectura inválida responde 400 y no reemplaza a la última conocida.
- `tests.py`: clase `LastKnownPositionTests` (6 pruebas). Sin migraciones.

### Contrato de la API
`GET /api/trips/active/` devuelve, además de lo existente:

| Campo | Significado |
|---|---|
| `last_position` | Última lectura válida (o `null`). |
| `position_age_seconds` | Segundos desde que se recibió la última lectura (o `null`). |
| `gps_max_interval_seconds` | Intervalo máximo esperado (15 s). |

Una posición se considera **desactualizada** si `position_age_seconds > gps_max_interval_seconds`.

### Frontend (`frontend/src/`)
- `hooks/useActiveTrip.js`: si falla el polling, conserva el recorrido y su última posición y solo agrega `connection_lost: true`. La siguiente respuesta correcta reemplaza el objeto completo.
- `components/map/RouteMap.jsx`: exporta `isPositionStale(trip)` (recorrido en curso, con posición previa, y lectura vieja o `connection_lost`). El marcador **nunca se oculta**.
- `components/map/Markers.jsx`: `BusMarker` recibe la prop `stale`.
- `components/StudentPanel.jsx`: ETA en "—" y texto de estado cuando la posición está desactualizada.
- `components/TopBar.jsx`: píldora de estado coherente con el mapa.
- `app.css`: reglas `.stale` (bus y chip).

### Estados visibles

| Situación | Píldora (arriba) | Chip del mapa | Bus |
|---|---|---|---|
| En curso con GPS fresco | En vivo | En vivo | Azul, con pulso |
| GPS sin llegar más de 15 s | Sin señal | Última posición conocida | Gris, sin pulso |
| Servidor sin respuesta | Sin conexión | Última posición conocida | Gris, sin pulso |
| En espera / sin recorrido | Sin señal | En espera / Sin recorrido activo | Sin cambios |

---

## Decisiones y límites
- **Recorrido terminado:** al pasar a Completado o Cancelado deja de ser activo y el bus no se muestra (la UH4 cubre interrupciones temporales, no recorridos finalizados).
- **ETA:** se oculta mientras la posición está desactualizada, para no mostrar un tiempo calculado con datos viejos.
- **Mockup:** el diseño del mapa se conserva. Lo único añadido son los estados `stale` (bus gris sin pulso, punto ámbar en el chip), que solo aparecen en esa situación.
- **Polling:** se mantiene cada 5 s (sin WebSockets), como en el Sprint 2.

## Para integrar con otras ramas
1. `isPositionStale` se exporta desde `RouteMap.jsx`; `TopBar.jsx` y `StudentPanel.jsx` la importan.
2. `connection_lost` lo agrega `useActiveTrip.js`; "Sin conexión" depende de él.
3. `tests.py` y `serializers.py` pueden tener conflictos con otras UH: conservar ambos bloques.

## Cómo probarla
1. Backend: `python manage.py test` (incluye las pruebas de la UH4).
2. Manual con `/conductor` y `/` abiertos y un recorrido en curso:
   - Cerrar la pestaña del conductor y esperar más de 15 s: bus gris, "Última posición conocida", píldora "Sin señal".
   - Detener `runserver`: píldora "Sin conexión", el bus se mantiene.
   - Reanudar GPS o servidor: vuelve a "En vivo" en unos segundos.