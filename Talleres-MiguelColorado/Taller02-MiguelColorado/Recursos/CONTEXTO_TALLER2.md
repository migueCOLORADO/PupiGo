# Contexto: Taller 2 - Frontend y BD (Django + Bootstrap)

## Ubicación de trabajo
`C:\Users\migue\Proyecto_Integrador_1\PupiGo\Talleres-MiguelColorado\Taller02-MiguelColorado\Recursos`

Punto de partida: el proyecto ya tiene el Taller 1 hecho (app `movie`, `moviereviewsproject`, modelo `Movie` con `title`, `description`, `image`, `url`).

## Archivos ya provistos (en la carpeta Recursos)
- `movies_initial.csv` — dataset de películas (columnas: imdbID, title, year, rating, runtime, genre, released, director, writer, cast, metacritic, imdbRating, imdbVotes, poster, plot, fullplot, language, country, awards, lastupdated, type)
- `add_movies_db.py` — comando Django ya escrito, carga 100 películas del CSV a `Movie` (title, genre, year, description=plot, image=default.jpg) — ADAPTAR a synopsis/poster, ver sección de decisión abajo
- `Fake.csv` — dataset de noticias (columnas: title, text, subject, date), usar para poblar `News`

## Elementos externos ya aportados (en carpeta Recursos/Imgs)
1. `Imgs/` — 10 pósters de películas/series del seed curado (Gladiator, Avatar TLA, Coco, Jurassic Park, Black Mirror, Her, Friends, Superbad, Fargo, No Country for Old Men)
2. Repo GitHub — rama de trabajo activa (verificar cuál es antes de commitear)
3. Las 6 capturas de pantalla finales del enunciado (se toman manualmente al final)

Pendiente de aportar:
- Imagen `home.png` para el navbar — YA GENERADA por Claude Code con Pillow, no requiere acción
- Imágenes para las 10 películas del CSV (mudas 1892-1914) — decisión: no se buscan, usar placeholder o dejar sin poster

## ESTADO ACTUAL (ya implementado por Claude Code — no repetir desde cero)

Ya hecho:
1. Bootstrap 5.3.3 + Cards responsive en home.html (sección "Catálogo completo", grid `row-cols-1 row-cols-md-3 g-4`, con poster/título/synopsis/género/año). Verificado responsive (3 col desktop, 1 col móvil).
2. App `news` completa: modelo, vista, urls, admin, template con horizontal cards (con CSS ajustado a tema oscuro)
3. requirements.txt con pandas y matplotlib agregadas
4. `add_movies_db.py` adaptado a campos reales (`synopsis`, `poster`, `release_year`, `director`, `duration`). 98 del CSV + 50 del seed = 148 películas cargadas
5. `add_news_db.py` creado — PERO usando datos de ejemplo propios, NO `Fake.csv` real (dijo que no estaba disponible; ya lo tienes en Recursos, hay que corregir esto)
6-10. Reutilizó `movie/templates/movie/base.html` existente (no creó `moviereviews/templates/base.html` nuevo) para navbar/footer/herencia. Footer con texto correcto. `news.html`, `statistics.html`, `signup.html`, `about.html` ya extienden ese base.
11. `statistics_view` con matplotlib: gráfica por año y por género (primer género, split por coma). Verificado en navegador.
12. Signup extra funcionando (GET → `/signup/?email=...`)

Decisiones ya tomadas y confirmadas:
- No se creó `default.jpg` porque `poster` es campo URL, no upload local — correcto, no cambiar
- No se tocó `STATICFILES_DIRS` porque ya estaba resuelto — correcto, no cambiar
- Ícono `home.png` generado con Pillow, puesto solo junto al link "Home" del navbar (conflicto con instrucción previa de "sin logos" ya resuelto a favor del requisito del taller)

## PENDIENTE — esto es lo que falta implementar

### A. Cargar Fake.csv real en vez de datos de ejemplo
- `Fake.csv` ya está en `Recursos/` (columnas: title, text, subject, date)
- Reescribir `add_news_db.py` para leerlo de ahí, mapeando `headline=title`, `body=text`
- Conversión de fecha obligatoria:
  ```python
  date_value = datetime.strptime(row['date'], '%B %d, %Y').date()
  ```
- Cargar 5 noticias (tomar las primeras 5 filas válidas del CSV)
- Volver a ejecutar `python manage.py add_news_db` (limpiar las de ejemplo primero si ya existen, o usar `update_or_create`)

### B. Cargar los 10 pósters reales
- Los 10 archivos de imagen están en `Recursos/Imgs/`
- Mapear cada imagen a su película correspondiente en la BD (por `title`) y actualizar el campo `poster`:
  - Gladiator (2000)
  - Avatar: The Last Airbender (2005, serie)
  - Coco (2017)
  - Jurassic Park (1993)
  - Black Mirror (2011, serie)
  - Her (2013)
  - Friends (1994, serie)
  - Superbad (2007)
  - Fargo (2014, serie)
  - No Country for Old Men (2007)
- Si `poster` es un campo `URLField`, subir las imágenes a `media/` (o carpeta que use el modelo) y setear la URL/ruta local relativa
- Si `poster` es `ImageField`/`FileField`, copiar cada imagen al `media/` correspondiente y asignarla vía el ORM
- Confirmar primero cómo está definido `poster` en `movie/models.py` antes de decidir el método

### C. Confirmar rama de trabajo
- Verificar cuál es la rama activa real en el repo antes de cualquier commit/push (el usuario está renombrando ramas, no asumir nombres anteriores — preguntar o listar ramas con `git branch` primero)

## Entregables finales (capturas a tomar)
1. Link a la rama en GitHub (crear rama con nombre del taller/autor)
2. Captura: ≥10 películas en cards Bootstrap (title, genre, year visibles) + navbar con imagen
3. Captura: mismo listado en ventana angosta (responsive, cards en vertical) + navbar
4. Captura: News en horizontal cards
5. Captura: gráfica películas por año
6. Captura: gráfica películas por género

## Commits sugeridos (mensajes usados en el taller de referencia)
1. "visualizacion de peliculas con estilo"
2. "inclusion de Cards"
3. "creacion de app news"
4. "llenado de la base de datos de peliculas"
5. "llenado de la base de datos de noticias"
6. "navbar y footer"
7. "generacion de graficas"

## Notas importantes
- No renombrar campos existentes del modelo real (`synopsis`, `poster`, `release_year`, etc.) ni tocar plantillas/vistas ya funcionando fuera de lo pedido en A, B, C
- Verificar `python manage.py makemigrations` y `migrate` después de cualquier cambio de modelo
- Al terminar A y B, confirmar en navegador: página News muestra las 5 noticias reales de Fake.csv, y las 10 películas del seed muestran su póster real (no placeholder)
