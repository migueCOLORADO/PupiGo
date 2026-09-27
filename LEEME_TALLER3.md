# Taller 3 — catálogo de 10 películas

Estado actual: 10 películas y 10 embeddings reales. Se conservan siete películas del
catálogo original y tres del CSV docente: La captura, Castillo medieval y Carmencita.
El catálogo de 150 está respaldado fuera del repositorio. Diez es una elección de
alcance, no un mínimo indicado por el profesor.

## Ejecutar
Abre Iniciar taller.cmd y visita http://127.0.0.1:8000/.
En otro equipo ejecuta preparar_en_otro_equipo.cmd; restaura solo una base vacía.
La clave Gemini se configura localmente con Configurar clave.cmd. No compartas .env.

## Comandos desde PowerShell en esta carpeta
```powershell
.\.venv\Scripts\python.exe manage.py update_movies_from_csv
.\.venv\Scripts\python.exe manage.py show_embedding
.\.venv\Scripts\python.exe manage.py movie_similarities 4 5 "Una historia sobre crimen y familia"
.\.venv\Scripts\python.exe manage.py verify_taller3
.\.venv\Scripts\python.exe manage.py test movie
```

El importador usa descripciones_seleccion_10.csv: tres filas literales seleccionadas
 del CSV del profesor. updated_movie_descriptions.csv conserva las 100 filas originales.
No se generan sinopsis nuevas al importar. La selección parcial es una adaptación
al catálogo reducido, no una afirmación de haber cargado los 100 títulos en esta versión.
Los embeddings son de gemini-embedding-001, dimensión 768, guardados en BinaryField.

## Imágenes y entrega
La aclaración docente del 27/09 sustituye la interpretación anterior: el proyecto
 debe generar imágenes mediante una IA integrada. No hace falta esperar la carpeta
 de ejemplos del profesor. La imagen previa de ChatGPT es una prueba manual y no
 acredita esa integración. Hugging Face está pendiente de configurar y probar.
No se ha activado facturación. No se ha grabado ni enviado el video.
Las evidencias con 150 películas y el embedding de The 400 Tricks of the Devil
son históricas; esa película no pertenece a la selección actual.
