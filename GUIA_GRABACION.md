# Guion de grabación — 10 películas

Generación desde Django probada con Hugging Face el 27/09/2026. No muestres .env
ni claves. Duración sugerida: 3–5 minutos; no es un requisito del profesor.

1. Presenta el proyecto Django y sus 10 películas. Explica que Gemini permite
   representar descripciones mediante embeddings y recomendar por similitud.
2. Muestra The Shawshank Redemption y la descripción reescrita en la prueba.
3. Busca Carmencita y explica que es uno de los tres títulos importados del CSV
   docente. Se conservaron las 100 filas originales en un archivo separado.
4. Muestra la generación de una imagen desde el código y el resultado asociado a
   la película. El comando es `manage.py update_images --movie-id 4`, usando el Python
   de .venv. Genera una sola imagen con FLUX.1-schnell mediante Hugging Face/Nscale.
   Ya existe una imagen generada; repetir el comando consume cuota gratuita.
5. En PowerShell ejecuta:
```powershell
.\.venv\Scripts\python.exe manage.py show_embedding
.\.venv\Scripts\python.exe manage.py movie_similarities 4 5 "Una historia sobre crimen y familia"
```
Explica los 768 valores del embedding y la similitud coseno.
6. Abre /recommendations/ y comprueba 10 de 10. Prueba:
   «Un pez padre recorre el océano para rescatar a su hijo».
   Comenta el resultado real. También puedes probar una historia de familia mafiosa.
7. Explica que solo se recomienda dentro del catálogo y que la similitud no es una
   probabilidad. Los embeddings se guardan para evitar regenerarlos en cada búsqueda.

Guarda capturas nuevas del recomendador y del embedding: las anteriores con 150
registros son históricas. Publica el video con acceso por enlace y verifica que se
pueda reproducir antes de enviarlo en https://forms.gle/BFvZSuuoKKHP4k8b6.
