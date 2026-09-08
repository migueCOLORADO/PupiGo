# PupiGo v1 (Sprint 2)

Backend Django + DRF y frontend React + Tailwind, fieles al mockup `pupigo-mockup.html`.

## Ejecutar

```bash
# Backend (usa el venv de la raíz del repo)
cd Challenges/02/backend
pip install -r requirements.txt
python manage.py migrate && python manage.py seed
python manage.py runserver 8000
```

```bash
# Frontend
cd Challenges/02/frontend
npm install
npm run dev
```

- Estudiante: `http://localhost:5173/`
- Conductor: `http://localhost:5173/conductor` (requiere permitir geolocalización; en Chrome funciona en `localhost` sin HTTPS)
- Admin: `http://localhost:8000/admin/` (`python manage.py createsuperuser`)

## API

| Método | Ruta | UH / RF |
|---|---|---|
| POST | `/api/trips/` `{direction: ida\|vuelta}` | crea recorrido **En espera** (RF-04) |
| POST | `/api/trips/{id}/start/` | **En curso** (RF-05) |
| POST | `/api/trips/{id}/complete/` | **Completado** (RF-19) |
| POST | `/api/trips/{id}/cancel/` | **Cancelado** desde espera o curso (RF-19b, UH8) |
| POST | `/api/trips/{id}/positions/` `{lat,lng,timestamp}` | lectura GPS, solo en curso (RF-06, UH3) |
| GET | `/api/trips/active/` | recorrido activo + `last_position`, o `null` (RF-06/07, UH2) |

Transiciones inválidas responden `409`. Solo puede existir un recorrido activo a la vez.

## Decisiones

- **Polling HTTP cada 5 s** (`useActiveTrip`) en lugar de WebSockets: un colectivo y una ruta fija no justifican Django Channels; cumple el NFR de 15 s con margen.
- **Envío GPS** (`useDriverGps`): `watchPosition` + heartbeat cada 5 s mientras el recorrido está en curso, para que haya lectura aunque el bus esté detenido. El rechazo del permiso muestra un aviso explícito y no se intenta compartir (UH5).
- **Posición en el mapa ilustrado**: el punto GPS se proyecta sobre el segmento Aguacatala→Las Hermosas (avance 0..1) y se ubica sobre el `path` SVG de la ruta con `getPointAtLength`. Las coordenadas viewBox se convierten a px del contenedor con `getScreenCTM`, por lo que los marcadores respetan el recorte `slice` en cualquier tamaño.
- **CSS del mockup portado 1:1** a `src/index.css` (tokens y componentes); Tailwind se usa para el layout responsive y utilidades nuevas. Breakpoints: `<768` mobile (sheet inferior), `768–1023` tablet (mapa arriba, barra abajo), `≥1024` desktop (74 % / 26 %).
- Coordenadas de la ruta sembradas en `tracking/management/commands/seed.py` (ajustar si se afinan los puntos reales).
