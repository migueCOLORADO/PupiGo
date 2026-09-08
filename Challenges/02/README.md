# PupiGo v1 (Sprint 2)

Backend Django + DRF y frontend React + Tailwind, fieles al mockup `pupigo-mockup.html`.

## Requisitos

- Python 3.13 (usado en desarrollo; versiones 3.11+ deberían funcionar)
- Node 18+
- Un venv activo en la raíz del repo (`../../venv` relativo a `Challenges/02/`)

## Ejecutar

### macOS / Linux / Git Bash

```bash
cd Challenges/02/backend
source ../../../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py createsuperuser   # solo la primera vez
python manage.py runserver 8000
```

### Windows (PowerShell/CMD)

`&&` no funciona como separador en PowerShell/CMD — correr cada línea por separado:

```powershell
cd Challenges\02\backend
..\..\..\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py createsuperuser
python manage.py runserver 8000
```

### Frontend (cualquier OS)

```bash
cd Challenges/02/frontend
npm install
npm run dev
```

- Estudiante: `http://localhost:5173/`
- Conductor: `http://localhost:5173/conductor` (requiere permitir geolocalización; en Chrome funciona en `localhost` sin HTTPS)
- Admin: `http://localhost:8000/admin/`

## Troubleshooting

**`["Faltan datos base (route, vehicle, driver). Ejecuta: manage.py seed"]`**
No corriste `python manage.py seed` después de `migrate`. Ejecutalo y refrescá.

**`Fatal Python error: init_import_site` al correr `runserver`**
El venv no está activado — Django está corriendo con el Python global del sistema, que puede tener paquetes en conflicto (ej. `pip-system-certs`). Activá el venv (ver pasos arriba) antes de correr cualquier comando `manage.py`.

**El panel del conductor no responde / geolocalización rechazada**
El navegador debe tener permiso de ubicación otorgado para `localhost`. Revisar el ícono de candado/ubicación en la barra de direcciones si fue bloqueado por error.

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

## Pendiente de documentar

- Configuración de CORS entre backend (`:8000`) y frontend (`:5173`) — confirmar si `django-cors-headers` está en `requirements.txt` y qué origins tiene whitelisteados.
- Variables de entorno / `.env` si `SECRET_KEY` u otros valores sensibles no están hardcodeados en `settings.py`.
