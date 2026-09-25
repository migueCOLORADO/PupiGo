# Video del Taller 3 — guía de grabación

Duración sugerida: 3 a 5 minutos (propuesta, no requisito del profesor).
Graba solo la ventana del navegador y, cuando corresponda, la terminal de comandos.
Nunca muestres `.env`, la clave, la página de API keys o datos de pago.

## Antes de grabar

Abre `Iniciar taller.cmd` desde el Explorador y deja esa ventana abierta.
Entra a http://127.0.0.1:8000/ . Si usas la vista previa que preparó el asistente,
su dirección es http://127.0.0.1:8001/ . Usa el mismo puerto durante todo el video.

Puedes usar la función de grabar pantalla que ya tengas disponible. Guarda el archivo
original del video antes de editarlo. El formulario no especifica duración.

## 1. Presentación y catálogo — unos 30 segundos

Muestra la página de películas y busca The Shawshank Redemption.

Texto sugerido:

«Soy Samuel Montoya. En este taller integré inteligencia artificial en mi proyecto
de películas con Django. Utilicé Gemini en su nivel gratuito para trabajar con
descripciones y embeddings. El catálogo contiene 50 películas.»

## 2. Descripción e ilustración — unos 40 segundos

Muestra la tarjeta de The Shawshank Redemption con la descripción y la ilustración.

«Realicé la prueba sobre una película. Su descripción fue reescrita con Gemini
3.1 Flash-Lite y la ilustración se generó con ChatGPT, siguiendo la alternativa
indicada por el profesor mientras se corrige el enlace de imágenes. Guardé el archivo
en media/movie/images y un comando de Django lo asoció con la película.»

No digas que las 50 imágenes o descripciones fueron generadas: solo una lo fue.

## 3. Embeddings y similitud — aproximadamente un minuto

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
$env:PYTHONUTF8='1'
.\.venv\Scripts\python.exe manage.py show_embedding
.\.venv\Scripts\python.exe manage.py movie_similarities 4 5 "Una historia sobre crimen y familia"
```

«Cada descripción se representa con 768 números, llamados embedding. Guardé los
50 vectores en SQLite usando un campo binario. Usamos el mismo modelo y tarea para
las películas y para la búsqueda. La similitud de coseno permite comparar los textos.»

El segundo comando consulta la API gratuita. Si aparece un error de cuota, espera
y vuelve a probar más tarde; no actives pagos. No inventes un resultado para el video.

## 4. Demostración del recomendador — aproximadamente un minuto

Entra en Recomendador IA. Comprueba que muestre 50 de 50.

Prueba estos textos, uno por uno:

- Una historia de una familia mafiosa y el poder del crimen organizado
- Un pez padre recorre el océano para rescatar a su hijo

«El programa convierte mi búsqueda en un embedding, calcula su similitud con cada
película y muestra la más cercana. En las pruebas obtuvimos The Godfather y Finding
Nemo. El puntaje es similitud entre textos, no una probabilidad ni una calificación.»

Comenta los resultados que realmente aparezcan al grabar. Solo recomienda dentro
del catálogo: una película inexistente en él nunca podrá aparecer como resultado.

## 5. Cierre — unos 20 segundos

«La integración permite enriquecer contenido y recomendar películas a partir del
significado de una descripción. Los embeddings se guardan para no generarlos en cada
búsqueda; cuando cambia una sinopsis, se debe actualizar su vector.»

## Alcance que falta confirmar antes de la entrega definitiva

- El CSV suministrado tiene 100 títulos distintos de los 50 locales. El comando
  importador existe, pero no ha actualizado el catálogo con ese material.
- Hay una ilustración de prueba. La carga del resto depende del material del profesor
  o de una instrucción que confirme el alcance de la alternativa con ChatGPT.

No presentes estos dos pendientes como completados. Si el profesor los dispensa,
registra su indicación y ajusta el relato del video.

## Entrega

1. Revisa que el video muestre el proyecto funcionando y que el audio se entienda.
2. Súbelo a un lugar accesible por enlace conforme a las indicaciones del profesor.
3. Comprueba que el enlace permita reproducirlo sin solicitar acceso.
4. En el formulario coloca correo, tu nombre y el enlace al video:
   https://forms.gle/BFvZSuuoKKHP4k8b6

El enlace localhost funciona solo mientras el servidor corre en tu computador;
no sirve como enlace al video para entregar.
