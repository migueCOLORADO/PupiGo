# 1.2. Component Diagram — PupiGo (Entrega 2)

Diagrama de Componentes (UML) de PupiGo — vista de implementación, con módulos, dependencias y aspectos de integración externos resaltados.

## Contenido de esta carpeta
- **`pupigo-componentes.drawio`** — fuente editable del diagrama. Ábrela en https://app.diagrams.net (*File ▸ Open*) o con la extensión de draw.io.
- **`descripcion-modulos.md`** — descripción de cada uno de los 11 módulos (lo que exige el enunciado: *"a description for each module"*).

## Qué falta agregar (Samuel)
- **`pupigo-componentes.png`** (o `.pdf`) — imagen exportada del diagrama para pegar en el documento de la entrega: abre el `.drawio` → *File ▸ Export as ▸ PNG/PDF*.

## Notación UML aplicada
Estereotipo `«component»` en cada módulo, `«external»` para integraciones, dependencias como flechas punteadas `«use»`, interfaces provistas con lollipop (`IAuth`, `IPersistencia`) y frontera de subsistema (aplicación Django).
