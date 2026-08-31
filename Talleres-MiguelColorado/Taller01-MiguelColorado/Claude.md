# Proyecto: moviereviews (estilo IMDB)

## Contexto
Taller individual de Django para el curso ST0251. El proyecto es un catálogo
de películas/series con reseñas, inspirado visualmente en IMDB (no streaming,
sin reproducción de video).

## Reglas de Git — IMPORTANTE
- Repo: PupiGo (repo de equipo, compartido con compañeros)
- Rama de trabajo: Miguel-Colorado-Taller01
- NUNCA hacer commit, push o merge sobre main/master
- Antes de cualquier cambio, verificar con `git branch` que la rama activa
  sea Miguel-Colorado-Taller01, pedir que se haga manual, explicando como hacerlo.

## Estructura
- Proyecto Django: moviereviews/
- App: movie/
- Todo el código de este taller vive dentro de Taller01-MiguelColorado/,
  no tocar nada fuera de esta carpeta (es el repo compartido de PupiGo)

## Modelos
- Movie: title, synopsis, release_year, genre, poster, director, duration
- Review: FK a Movie, reviewer_name, rating (1-10), comment, created_at

## Vistas requeridas (obligatorias para la entrega)
- home (debe mostrar mi nombre)
- about
- movie_list (todas las películas)
- search (filtro por título)
- movie_detail (opcional, para el look IMDB)

## Estilo visual
Navbar oscuro negro/dorado tipo IMDB, tarjetas de película con póster +
título + año + badge de rating. Bootstrap por CDN está bien para ir rápido.

## Entorno
Windows, Git Bash (MINGW64), Python 3.13, Django 6.0.7, venv en venv/.
Para comandos interactivos (createsuperuser, changepassword) usar `winpty`
antes del comando por un problema de TTY conocido en esta terminal.