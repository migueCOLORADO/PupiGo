# 1.2 Component Diagram - Descripcion de modulos (PupiGo)

### 3) Tabla de descripción por módulo

| # | Módulo (componente) | Responsabilidad | Depende de | ¿Punto de integración? |
|---|---------------------|-----------------|------------|:----------------------:|
| 1 | **Cliente Web / UI** | Renderiza las vistas (templates Django + Bootstrap), muestra el mapa con la posición del bus y la ruta EAFIT–metro, y captura la interacción del usuario. | Autenticación, Tracking, Notificaciones, Reservas, Panel Admin, API de Mapas | Sí (consume API de mapas en el navegador) |
| 2 | **Autenticación / Usuarios** | Registro, login/logout, sesiones y control de acceso por rol (usuario / admin). Provee la interfaz `IAuth`. | Capa de Datos | No |
| 3 | **Tracking en Tiempo Real** | Núcleo del MVP: obtiene la posición del bus, calcula ETA y expone la ubicación actual sobre la ruta. Provee `ITracking`. | Capa de Datos, API de Mapas, Fuente GPS | **Sí** (fuente GPS + geocoding/ETA de mapas) |
| 4 | **Notificaciones / Incidentes** | Genera alertas de llegada e incidentes en la ruta y las despacha al usuario. Se suscribe a eventos de Tracking. | Capa de Datos, Tracking, Servicio de Notificaciones | **Sí** (push/email externo) |
| 5 | **Reservas + QR** | (Sprint 3) Gestiona reservas de cupo y genera/valida el código QR de abordaje. | Capa de Datos, Autenticación | No |
| 6 | **Panel de Administración** | (Sprint 4) Gestión operativa: rutas, horarios, buses y monitoreo. Vista consolidada de tracking y reservas. | Capa de Datos, Autenticación, Tracking, Reservas | No |
| 7 | **Capa de Datos / ORM** | Abstrae la persistencia vía Django ORM; mapea modelos a tablas y centraliza el acceso a datos. Provee `IPersistencia`. | PostgreSQL | No |
| 8 | **PostgreSQL** | Almacenamiento relacional de usuarios, buses, rutas, posiciones, reservas y notificaciones. | — | No |
| 9 | **API de Mapas / Geolocalización** | Servicio externo de mapas: tiles, trazado de ruta, geocoding y estimación de tiempos. | — (externo) | **Sí — integración** |
| 10 | **Fuente de ubicación del bus / GPS** | Dispositivo GPS a bordo o API de terceros que emite la posición del "Pupi móvil". Alimenta a Tracking. | — (externo) | **Sí — integración** |
| 11 | **Servicio de Notificaciones** | Proveedor externo de push/email para entregar alertas al usuario final. | — (externo) | **Sí — integración** |

---

### Notas para la sustentación
- **Aspecto de integración (lo que la plantilla exige en la vista de implementación):** los tres componentes naranja son fronteras del sistema. La app Django **no genera** posición ni mapas: los consume. Eso desacopla el MVP de tracking del hardware/proveedor y permite cambiar de proveedor de mapas o de fuente GPS sin tocar la lógica de dominio.
- **Notación UML aplicada:** estereotipo `«component»` en cada módulo, `«external»` para integraciones, dependencias como flechas punteadas `«use»`, interfaces provistas con lollipop (`IAuth`, `IPersistencia`), y frontera de subsistema punteada.
- **Trazabilidad con el roadmap:** Tracking (Sprint 1), Notificaciones (Sprint 2), Reservas+QR (Sprint 3), Panel Admin (Sprint 4).
- **Aclaración honesta:** el código Django del MVP aún no está en `main` del [repo](https://github.com/migueCOLORADO/PupiGo); el diagrama refleja la arquitectura planeada, no componentes ya implementados.

Queda **in_review** para revisión de Samuel (board) y uso en la Entrega 2.
