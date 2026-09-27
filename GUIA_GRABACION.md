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

## Catálogo completo de imágenes — 27/09/2026
Las diez películas tienen una imagen generada desde Django mediante Hugging Face,
FLUX.1-schnell y Nscale. Las nueve solicitudes adicionales terminaron correctamente;
no hubo errores de cuota ni se activaron pagos. Se validaron los archivos y sus
huellas SHA256 contra los registros de generación. No hay imágenes pendientes.
Algunas salidas contienen letras deformadas o marcas pese al prompt que las excluye;
son ilustraciones de IA, no carteles oficiales. Se conservan los resultados reales.
Los prompts exactos están en los registros evidencias/taller3/hf_*.json.
Las capturas anteriores con carteles predeterminados muestran una etapa anterior.
Para el video utiliza la página actual con las diez imágenes ya guardadas.
Restan grabar/publicar el video y enviar el formulario; conviene actualizar la
captura del catálogo completo para documentar este último cambio.
