# PupiGo | Proyecto Integrador 1 (PI1)

## Table of Contents
1. [Description](#description)
   1. [Context](#context)
   2. [Problem](#problem)
   3. [Proposed Solution](#proposed-solution)
2. [Product Vision](#product-vision)
3. [Target Group](#target-group)
4. [Needs](#needs)
5. [Business Goals](#business-goals)
6. [Alternative Solutions](#alternative-solutions)
7. [MVP Scope](#mvp-scope)
8. [Domain Model](#domain-model)
9. [How to Run](#how-to-run)
   1. [Requirements](#requirements)
   2. [Repository Structure](#repository-structure)
   3. [Backend](#backend)
   4. [Environment Variables](#environment-variables)
   5. [Frontend](#frontend)
   6. [Tests](#tests)
   7. [Access Routes](#access-routes)
   8. [Trying a Full Trip](#trying-a-full-trip)
   9. [Troubleshooting](#troubleshooting)
   10. [Technical Decisions](#technical-decisions)
10. [Project Management](#project-management)
11. [Authors](#authors)
12. [Course Information](#course-information)

## Description

### Context

For several semesters, the EAFIT University student community has reported a sustained increase in robbery incidents along the route connecting the university with the metro station, particularly during the afternoon and evening hours. Students raised their concerns with university leadership, pointing out that these incidents not only caused economic harm but also directly affected the emotional stability of those involved and generated a widespread sense of insecurity and fear among everyone who had to travel that route daily.

As a first response, the student community itself organized an informal accompaniment group known as **"Caminantes"**, where students coordinated their departures by chat, agreed on a meeting point, and walked the route together. Once it became clear that this measure did not solve the underlying problem, the community requested additional support from the city government and the university's security staff, which considerably reduced the number of robberies.

However, the solution that ultimately became the most viable for providing calm and safety was transportation managed by the university itself: initially a van with limited capacity, nicknamed by the community as the **"Pupi móvil"**, which covered routes at certain times, and which later evolved into a higher-capacity collective bus (**"el colectivo"**). This solution is still managed completely informally through the WhatsApp group **"Caminantes EAFIT"**, where students ask via a sticker that reads *"¿Por dónde pasa el Pupi móvil?"* ("Where is the Pupi móvil right now?") and wait for someone who has the information to reply.

This dynamic means that students waiting at the meeting points, whether at the university, next to **Las Hermosas**, or at the metro station's stop, depend entirely on someone informed responding in the group in order to make a decision. As a result, they don't know for certain when the bus will arrive, they lose time waiting without reliable information, and in many cases end up walking alone rather than risk missing the transport, exposing themselves again to the very risk that started the whole problem.

### Problem

With the purpose of reducing the uncertainty and waiting times of students who depend on the EAFIT-metro transportation service, the student community requested the development of an information system that provides real-time visibility of the transport, replacing informal chat-based coordination with a formal web platform.

The system must allow **users** to be registered, who can create an account on the platform by providing information such as a unique identifier, full name, institutional email, password, role (student, driver, or administrator), and registration date.

The system will include **collectives** (buses), representing the vehicles assigned to the transport service, uniquely identified by a license plate or internal identifier. Each collective will store information such as its passenger capacity and its status (active or inactive). Each collective may have a **driver** assigned per shift, linked to a system user with the corresponding role.

The system will allow **routes** to be defined, identified by a unique code, describing the path the transport follows between an origin point and a destination point, along with its regular operating schedule. Each route will be made up of one or more **stops**, understood as the meeting points recognized by the community (for example, **Las Hermosas** or the metro stop), identified by a name and its geographic location.

Every time a collective covers a route at a given time, the system will record a **trip**, uniquely identified, storing the associated route, the assigned collective, the driver in charge, the start time, the end time, and its status (in progress, finished, or cancelled). During each trip, the system will periodically capture the collective's **real-time location**, recording latitude, longitude, and the corresponding timestamp, in order to show its position on the map to users who are waiting.

Users will be able to receive **notifications** related to a specific trip, for example when the collective is close to their stop or when there is a change to the usual route. They will also be able to generate **incident reports**, recording the type of incident, a description, the location where it occurred, and the date, in order to keep the community informed about relevant events during the route.

The system will also allow users to check their **trip history**, i.e., the trips they have previously followed or used through the platform.

In a later phase, the system must support seat management through **reservations**, identified by a unique code, linking a user to a specific trip and recording its status (confirmed, waitlisted, or cancelled). Each confirmed reservation may have an associated **QR code validation**, recording the generated code and the timestamp at which the driver validated the passenger's boarding.

### Proposed Solution

**PupiGo** is a web application, accessible from a URL with no installation required, that replaces informal chat-based coordination with a formal, real-time visibility system for the EAFIT-metro transport service. On an illustrated map, students can see the collective's current location, the route it is following and the estimated arrival time; the driver shares the location from the browser.

The solution is built incrementally across sprints (plan as recorded in the [GitHub Project](https://github.com/users/migueCOLORADO/projects/4)):

- **Sprint 1:** product vision, domain model and mockup.
- **Sprint 2 (v1.0):** manage a trip and share location (UH1), view the shuttle's status and location (UH2), periodic GPS updates (UH3), GPS permission handling (UH5) and trip cancellation (UH8).
- **Sprint 3:** last known position (UH4), fixed EAFIT-Metro route with stops (UH6), shuttle direction with driver, plate and route (UH7), brand identity and usable interface (UH9) and an AI assistant for questions about the shuttle (UH10).
- **Sprint 4 (planned):** estimated time of arrival to a stop (Feature 11), user authentication (Feature 12), notifications (Feature 13), administration of routes, vehicles and drivers (Feature 14) and trip history (Feature 15).

## Product Vision

Our motivation is to reduce the uncertainty that students experience on their trip between EAFIT and the metro, giving them clear and timely access to the information they need to know what to expect. We want them to stop losing time waiting without knowing whether the bus will arrive or not, and for that waiting and travel time to be reduced by having real, accessible information exactly when they need it. The positive change we want to achieve is for students to be able to plan their departure with certainty, without depending on blindly coordinating with other classmates or taking risks due to lack of information.

**"Menos espera, más certeza."** *(Less waiting, more certainty.)*

*(See the Product Vision Board in [`Product Vision/Product Vision Board 3.png`](https://github.com/migueCOLORADO/PupiGo/blob/Sprint-1/Product%20Vision/Product%20Vision%20Board%203.png) on the `Sprint-1` branch.)*

## Target Group

We are targeting EAFIT students who use the transport service (**el colectivo**, formerly the **"Pupi móvil"**) to travel between the university and the metro station, especially during the afternoon and evening hours, which carry the highest risk. In particular, we are thinking of students who have classes until late, students who fully depend on this transport because they have no other safe alternative, and students who currently end up walking alone because they don't know whether they'll make it in time to catch the bus.

## Needs

The problem we are solving is the lack of real-time information about the transport: students don't know for certain when the bus will arrive, they lose time waiting without knowing whether it's worth staying or walking, and they often end up making the trip alone rather than risk missing it. The benefit we offer is reducing that uncertainty and that risk exposure, giving them real visibility into where the bus is, which route it's following, and how much longer until it arrives.

## Business Goals

For the university, this app represents a direct benefit to student wellbeing and safety, which is precisely what has driven all the prior investment in **Caminantes** and **el colectivo**. The business goals are: reduce the perception of insecurity and complaints related to the EAFIT-metro route, increase students' trust in the existing transport service, and, over time, through the administrative panel, give those who manage the service real data on routes and schedules to optimize resources.

## Alternative Solutions

The solution considered most viable for providing calm and safety was implementing what was initially named the **"Pupi móvil"**, a van with limited seating that covered routes at certain times. It was later replaced with a higher-capacity collective bus. This is managed through the group called **"Caminantes EAFIT"**, where people ask via a sticker that reads *"Por donde pasa el Pupi móvil"* against a background image of the famous van nicknamed by the community. Through this, people waiting at the university stops (next to **Las Hermosas**) or at the metro (next to the stop by the station) manage to "find out" the transport's location and make decisions accordingly. However, to this day there is no app or formal system that gives them real visibility of the transport; everything depends on someone with the information responding to the sticker in the group and letting those waiting know.

## MVP Scope

Domain entities implemented in the backend (`backend/tracking/models.py`):

- **Route**: fixed route with origin and destination (name and coordinates).
- **Stop**: stops of a route, in order.
- **Vehicle**: plate and name of the shuttle.
- **Driver**: driver name.
- **Trip**: route, vehicle, driver, direction (Metro to EAFIT or EAFIT to Metro) and status (waiting, in progress, completed, cancelled).
- **Position**: GPS readings of a trip (latitude, longitude, timestamp).

Not implemented yet (later phases): users and authentication, notifications, incident reports, trip history, reservations and QR code validation.

## Domain Model

The current relational data model, with entities, attributes and cardinalities, is in the wiki: [1.3. Data Model](https://github.com/migueCOLORADO/PupiGo/wiki/1.-Architecture-and-Data#13-data-model). The deployment and component diagrams are on the same page.

The original domain model of Sprint 1 is kept in [`Diagrams/domainDPupiGo.pdf`](https://github.com/migueCOLORADO/PupiGo/blob/Sprint-1/Diagrams/domainDPupiGo.pdf) on the `Sprint-1` branch.

## How to Run

Backend Django + Django REST Framework and frontend React + Vite + Tailwind CSS. Start the backend first and then the frontend.

### Requirements

| Tool | Version used to validate these steps |
|---|---|
| Python | 3.13.7 |
| Node.js / npm | 24.8.0 / 11.4.1 |
| Git | any recent version |

### Repository Structure

```
PupiGo/
  requirements.txt              Python dependencies (backend)
  backend/
    manage.py
    requirements.txt            includes ../requirements.txt
    pupigo/                     Django project: settings.py, urls.py, wsgi.py
    tracking/                   app: models, API views, serializers, AI assistant, seed command, tests
  frontend/
    package.json                scripts and dependencies (npm)
    .env.example                VITE_API_URL
    src/                        pages, components, map, hooks, api.js
  UH4_ultima_posicion_conocida.md
  UH9_identidad_marca_interfaz.md
  UH10_asistente_ia.md          feature documentation
  CONTEXT_v1_Sprint2.md         context of the v1 (Sprint 2)
  pupigo-mockup.html            interactive mockup
  README.md
```

Branch model: `main` <- `Sprint-N` <- `feature-<n>-<description>`.

- `main`: the integrated application; receives each sprint once it is finished, by pull request.
- `Sprint-N`: integration branch of the sprint; receives the feature branches by pull request. `Sprint-1` and `Sprint-2` keep the deliverables of those sprints.
- `feature-<n>-<description>`: one branch per Feature (for example `feature-10-asistente-ia`).

### Backend

Run from the repository root.

macOS / Linux / Git Bash:

```bash
python -m venv venv
source venv/bin/activate              # Git Bash on Windows: source venv/Scripts/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py seed
python manage.py createsuperuser      # optional, only to use /admin/
python manage.py runserver 8000
```

Windows PowerShell (run each line separately):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py seed
python manage.py createsuperuser
python manage.py runserver 8000
```

| Command | What it does | Parameters |
|---|---|---|
| `python manage.py migrate` | Creates the SQLite database `backend/db.sqlite3` and its tables | - |
| `python manage.py seed` | Creates the fixed route (Estación Aguacatala - Entrada Las Hermosas) with its 2 stops, the vehicle `PUPI01` and the driver "Conductor PupiGo". Safe to run more than once | No custom parameters |
| `python manage.py createsuperuser` | Creates an admin user for `/admin/` (asks for user name, email and password) | Optional |
| `python manage.py runserver 8000` | Starts the API on `http://localhost:8000` | Port (or `address:port`) as argument |

### Environment Variables

`backend/.env` (optional, not stored in the repository):

| Variable | Use | If it is missing |
|---|---|---|
| `ASSISTANT_API_KEY` | Key of the AI provider (Anthropic) for the assistant | The assistant answers in automatic mode with the system data, without AI |
| `ASSISTANT_MODEL` | Model ID used by the assistant | Same as above (both are required to use AI) |

```
ASSISTANT_API_KEY=<your-key>
ASSISTANT_MODEL=<model-id>
```

The backend also reads `DJANGO_SECRET_KEY` and `DJANGO_DEBUG` from the process environment; without them it uses development defaults (`settings.py`).

`frontend/.env` (optional):

| Variable | Use | Default (`frontend/.env.example`) |
|---|---|---|
| `VITE_API_URL` | Base URL of the API | `http://localhost:8000/api` |

### Frontend

```bash
cd frontend
npm install
npm run dev        # development server on http://localhost:5173
npm run build      # production build in frontend/dist
npm run lint       # oxlint
npm run preview    # serves the build locally
```

If port 5173 is in use, Vite takes the next free one and shows it in the terminal.

### Tests

| Command | Result |
|---|---|
| `cd backend && python manage.py test` | 25 backend tests (trips API, AI assistant and route stops) |
| `cd frontend && npm run lint` | Static analysis with oxlint |
| `cd frontend && npm run build` | Checks that the frontend compiles |

The frontend has no automated test suite (`package.json` has no `test` script).

### Access Routes

| URL | Use |
|---|---|
| `http://localhost:5173/` | Student view: trip status, map, assigned shuttle and AI assistant |
| `http://localhost:5173/conductor` | Driver view: manage the trip and share the GPS location (the browser asks for location permission) |
| `GET http://localhost:8000/api/` | API index |
| `GET http://localhost:8000/api/trips/` | List of trips |
| `POST http://localhost:8000/api/trips/` | Create a trip in "waiting", body `{"direction": "ida"}` or `"vuelta"` |
| `GET http://localhost:8000/api/trips/{id}/` | Trip detail |
| `POST http://localhost:8000/api/trips/{id}/start/` | Start the trip |
| `POST http://localhost:8000/api/trips/{id}/complete/` | Complete the trip |
| `POST http://localhost:8000/api/trips/{id}/cancel/` | Cancel a waiting or in-progress trip |
| `POST http://localhost:8000/api/trips/{id}/positions/` | GPS reading, body `{"lat", "lng", "timestamp"}` (only while in progress) |
| `GET http://localhost:8000/api/trips/active/` | Active trip with its last position, or empty if there is none |
| `POST http://localhost:8000/api/assistant/` | Ask the assistant, body `{"question": "..."}` |
| `http://localhost:8000/admin/` | Django admin (requires `createsuperuser`) |

Invalid state transitions respond `409`. Only one active trip can exist at a time.

### Trying a Full Trip

1. Open `http://localhost:5173/conductor`, choose the direction and press **Poner en espera**. The student view (`http://localhost:5173/`) shows the trip "En espera".
2. Allow the location in the browser and press **Iniciar recorrido**. The driver view sends the GPS position every 5 seconds.
3. In the student view, the shuttle appears on the map and the status changes to in progress; the assistant answers questions such as "¿Dónde está el colectivo?".
4. Press **Finalizar recorrido** (or **Cancelar recorrido**) in the driver view. The student view shows that there is no active trip.

### Troubleshooting

**`["Faltan datos base (route, vehicle, driver). Ejecuta: manage.py seed"]`**
`python manage.py seed` was not run after `migrate`. Run it and refresh.

**`Fatal Python error: init_import_site` on `runserver`**
The venv is not activated and Django is running on the system's global Python. Activate the venv before any `manage.py` command.

**Driver panel shows "Permiso de ubicacion rechazado"**
The browser must allow location for `localhost`. Check the location icon in the address bar and reload the page.

### Technical Decisions

- **HTTP polling every 5 s** (`useActiveTrip`) instead of WebSockets: one shuttle and a fixed route do not justify Django Channels, and it meets the 15 s latency requirement.
- **GPS submission** (`useDriverGps`): `watchPosition` plus a 5 s heartbeat while the trip is in progress, so there is a reading even if the bus is stopped.
- **Illustrated map:** the GPS point is projected onto the route and placed on the SVG `path`, so markers stay on the drawing at any screen size.
- **AI assistant:** the backend calls the AI provider over HTTPS with Python's standard `urllib` (no extra dependency) and an 8 s timeout; without configuration or on error it answers in automatic mode with the same data (`UH10_asistente_ia.md`).
- **CORS:** `django-cors-headers` with `CORS_ALLOW_ALL_ORIGINS = True` for local development.

## Project Management

This project is managed with a **GitHub Project** (backlog and Kanban), following the **MoSCoW** prioritization method (Must have, Should have, Could have, Won't have).

- [GitHub Project](https://github.com/users/migueCOLORADO/projects/4): [Priority board](https://github.com/users/migueCOLORADO/projects/4/views/2), [Backlog](https://github.com/users/migueCOLORADO/projects/4/views/1)
- [Wiki](https://github.com/migueCOLORADO/PupiGo/wiki): deliverables, backlog with status and responsible, weekly meetings and retrospectives ([Deliverable 3, 5. Project Management](https://github.com/migueCOLORADO/PupiGo/wiki/5.-Project-Management-D3))

## Authors

Team **Los Integradores**:

| Member | GitHub |
|---|---|
| Miguel Ángel Colorado Castaño | [migueCOLORADO](https://github.com/migueCOLORADO) |
| Juan Diego Muñoz Buitrago | [mrdidih](https://github.com/mrdidih) |
| Daniel Mauricio Giraldo Moreno | [dani-g11](https://github.com/dani-g11) |
| Julian Peña Ochoa | [Kiler56](https://github.com/Kiler56) |
| Samuel Montoya Espinosa | [Smonto-06](https://github.com/Smonto-06) |

## Course Information
**Course:** ST0251 Proyecto Integrador 1 (PI1)
**Professor:** Wilmer Alberto Gil Moreno
**University:** EAFIT University | School of Applied Sciences and Engineering
**Program:** Systems Engineering
**Year:** 2026-2

PI1 is a project-based course where prior knowledge (past, present, and future) is leveraged to develop software products through various challenges. The course applies agile practices and evolutionary engineering across four sprints, delivering an MVP with impactful functionality.

**Technical requirements:** Web application, Python and Django, Data Analytics.
**Teamwork:** Teams of 3 to 5 students, working in English, no changes allowed to team composition or project after the first deliverable.
**Development practices:** Layers (MVC/MVT), Modeling, Continuous Integration, Continuous Delivery.
