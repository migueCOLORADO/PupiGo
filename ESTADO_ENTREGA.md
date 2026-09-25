# Taller 3 — Samuel Montoya

## Requisitos y evidencia

| Guía | Implementación | Evidencia |
|---|---|---|
| 1–3: proyecto y API | Rama individual y adaptación a Gemini en nivel gratuito | Código y `.env.example` sin credenciales |
| 4: descripciones | Prueba de una descripción con Gemini; carga literal de las 100 filas docentes conservando 50 películas anteriores | Captura `02_descripcion_csv.png`, CSV fuente e importador |
| 5: imágenes | Prueba de una ilustración con ChatGPT; importación y asociación al registro | Captura `01_imagen_chatgpt.png` y comando `update_images_from_folder` |
| 6: similitud | Dos películas y un prompt comparados mediante coseno | `06_similitudes_reales.txt` |
| 7: recomendaciones | Embeddings reales persistidos en BinaryField y formulario de recomendación | `03_embedding_real.txt`, comando `verify_taller3` y captura del recomendador |

## Pendiente externo de la guía 5

La guía requiere importar todas las imágenes suministradas. El enlace SharePoint
no es accesible y el usuario informa que el profesor lo está arreglando y permite
usar ChatGPT mientras tanto. Se hizo la prueba de una película conforme a esa
alternativa. Las otras películas muestran la imagen predeterminada.

La prueba no demuestra que esté completada la importación de toda la carpeta.
No se supone una dispensa del profesor. Cuando el material esté disponible,
copiar sus PNG en `media/movie/images/` y ejecutar:

```powershell
.\.venv\Scripts\python.exe manage.py update_images_from_folder
```

No se generaron cientos de imágenes: la nota final de la guía indica que no es
necesario regenerarlas y que se debe cargar la carpeta entregada.
Fuente: https://github.com/jdmartinev/TallerIA_PI/blob/main/5_movie_pictures.md

## Entrega por completar

El entregable del formulario es un enlace público a un video de funcionamiento.
Las capturas y este paquete acompañan la preparación, pero no reemplazan el video.
Seguir `GUIA_GRABACION.md`, grabar la demostración, publicar el video y comprobar
su acceso antes de enviar el enlace en https://forms.gle/BFvZSuuoKKHP4k8b6.

El código está preparado en una copia Git de la rama individual. Un commit local
no implica que se haya publicado en GitHub. No se ha enviado el formulario.
