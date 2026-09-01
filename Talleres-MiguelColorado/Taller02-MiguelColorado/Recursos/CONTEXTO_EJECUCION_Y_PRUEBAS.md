# Contexto: Guía de ejecución y pruebas — Taller 2

Este documento es para que Claude Code genere una guía práctica que el usuario ejecute por su cuenta, sin depender de que Claude Code corra el servidor por él.

## Objetivo
1. Lista detallada de pasos para levantar el proyecto localmente desde cero (Windows, con venv).
2. Checklist de pruebas manuales (qué URL visitar, qué debería ver) para validar cada parte del Taller 2.
3. Ejemplos de pruebas unitarias de Django (`TestCase`) que el usuario pueda correr con `python manage.py test`.

## 1. Pasos de ejecución esperados (a detallar)
Debe cubrir, en orden, con los comandos exactos para Windows PowerShell:
- Activar el entorno virtual
- Instalar dependencias (`pip install -r requirements.txt`)
- Verificar migraciones pendientes y aplicarlas
- Verificar si hace falta correr algún comando de seed/carga de datos (movies, news) y en qué orden
- Crear superusuario si no existe (para entrar a `/admin/`)
- Levantar el servidor (`python manage.py runserver`)
- URLs clave a visitar para verificar que todo cargó: home, news, statistics, admin, signup

## 2. Checklist de pruebas manuales (a generar como tabla o lista)
Por cada funcionalidad del taller, indicar: URL a visitar, qué debe verse, y qué indica que algo falló. Cubrir mínimo:
- Home: cards de películas con poster/título/synopsis/género/año, responsive en ventana angosta
- News: horizontal cards con headline/body/date de las 5 noticias reales de Fake.csv
- Statistics: ambas gráficas (por año, por género) se renderizan sin error
- Navbar: todos los links funcionan (Home, News, Statistics, Sign Up)
- Signup: enviar email y ver el mensaje de confirmación
- Admin: poder ver/editar Movie y News desde `/admin/`

## 3. Ejemplos de pruebas unitarias (a generar)
Pedir código real de `TestCase` de Django, no solo descripciones, cubriendo mínimo:
- Test de modelo `Movie`: crear instancia, verificar `__str__`, verificar que campos opcionales aceptan blank/null
- Test de modelo `News`: crear instancia, verificar `__str__`, verificar orden por fecha descendente
- Test de vista `home`: status 200, template usado, contexto contiene `movies`
- Test de vista `news`: status 200, noticias ordenadas correctamente
- Test de vista `statistics_view`: status 200, contexto contiene las claves de las gráficas (base64 no vacío)
- Test de vista `signup`: GET con parámetro `email`, verificar que aparece en el contexto/respuesta
- Test de comando `add_movies_db`: correrlo contra una DB de test y verificar que crea registros (usar `call_command`)
- Test de comando `add_news_db`: mismo enfoque, verificar conteo y que la fecha se parseó correctamente

Debe explicar dónde poner estos archivos (`movie/tests.py`, `news/tests.py`) y cómo correrlos (`python manage.py test`, `python manage.py test movie`, `python manage.py test news.tests.NewsModelTest`).

## Formato esperado de salida
Un documento claro con 3 secciones (ejecución, pruebas manuales, pruebas unitarias), pensado para que el usuario lo siga sin ayuda adicional de Claude Code en el momento.
