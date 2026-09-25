# Taller 3 — adaptación a Gemini sin pagos

## Estado real

Código preparado y 13 pruebas automáticas aprobadas con respuestas simuladas de la API.
Verificación Django y migraciones sin errores. Página revisada en navegador.
Actualización 24 de septiembre de 2026: conexión real a Gemini comprobada.
Hay 50 de 50 embeddings actuales, una descripción reescrita con gemini-3.1-flash-lite
y tres búsquedas verificadas en navegador. No se guardan vectores aleatorios.
Ver `evidencias/taller3/VERIFICACION_REAL.md` para resultados y pendientes.

Esta copia conserva las 50 películas y las noticias anteriores. El original permanece
en C:\Users\USUARIO\moviereviewsproject, rama Samuel-Montoya-Talleres-PI.
La copia no incluye .git; no se ha publicado ningún cambio en GitHub.

## Configurar la clave

1. Comprueba que tu proyecto de Google AI Studio muestra Free tier y no tiene
   facturación activada. La aplicación no puede comprobar tu facturación.
2. Abre `Configurar clave.cmd` en el Explorador. Confirma SI y pega la clave
   cuando se solicite; la entrada se oculta y no se imprime.
3. El asistente crea `.env`, excluido de Git. No sobrescribe un archivo existente.
   Esta carpeta está en OneDrive: si sincronizas esta ubicación, .env también
   podría sincronizarse. No compartas la carpeta con ese archivo.
4. La clave no debe aparecer en chats, capturas, videos ni entregas.

No se activa facturación ni se usan modelos de imágenes de pago. La opción
GEMINI_FREE_TIER_CONFIRMED registra tu confirmación; no es un límite de gasto
impuesto por Google. Mantén el proyecto en Free tier.

## Ejecutar en este computador

Abre PowerShell en esta carpeta. El entorno `.venv` ya está instalado.

```powershell
$env:PYTHONUTF8='1'
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py migrate
# Reescribe UNA descripción con Gemini (no todo el catálogo):
.\.venv\Scripts\python.exe manage.py update_descriptions
# Genera hasta 5 embeddings faltantes. Repite para completar las 50 películas:
.\.venv\Scripts\python.exe manage.py movie_embeddings --limit 5
.\.venv\Scripts\python.exe manage.py show_embedding
# IDs existentes en esta copia: 4 y 5. Puedes elegir otros:
.\.venv\Scripts\python.exe manage.py movie_similarities 4 5 "Una historia sobre crimen y familia"
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
```

También puedes abrir `Iniciar taller.cmd`. Visita
http://127.0.0.1:8000/recommendations/ . El servidor es solo para uso local.
Si el puerto ya está ocupado porque la vista previa sigue abierta, utiliza esa
vista previa o detén primero el servidor anterior.

Ante un error de cuota, el comando se detiene conservando lo ya generado. Reanuda
más tarde con el mismo comando; no necesitas pagar ni regenerar los vectores actuales.
Cada búsqueda válida con catálogo listo realiza una petición de embedding.

En otro equipo instala Python 3.12 o superior, crea un entorno virtual e instala
`requirements.txt`. El entorno .venv no debe copiarse entre equipos.

## Materiales del profesor: dos diferencias pendientes

### Descripciones

Se descargó `updated_movie_descriptions.csv` desde:
https://github.com/jdmartinev/TallerIA_PI/blob/main/aux_files/updated_movie_descriptions.csv

Contiene 100 títulos distintos de las 50 películas de esta base. La importación
se ejecutó y encontró CERO coincidencias. No se asignaron sinopsis de otras películas.
El importador está implementado y probado, pero la evidencia real de importación
requiere un CSV correspondiente a este catálogo o acordar ampliar el catálogo con
los títulos del material. No se inventaron correspondencias entre títulos.

```powershell
.\.venv\Scripts\python.exe manage.py update_movies_from_csv --file "ruta_al_csv_correcto.csv"
```

### Ilustraciones

La guía dice que basta cargar las imágenes ya generadas por el profesor:
https://github.com/jdmartinev/TallerIA_PI/blob/main/5_movie_pictures.md

Su enlace SharePoint devolvió: «no puede acceder a este documento».
Solicita el ZIP o un enlace accesible. Coloca las imágenes correspondientes en
`media/movie/images/` con nombre `m_TITULO_EXACTO.png`, luego ejecuta:

```powershell
.\.venv\Scripts\python.exe manage.py update_images_from_folder
```

El comando valida los archivos y conserva la imagen anterior si falta el archivo.
Se generó una ilustración de prueba de The Shawshank Redemption con la herramienta
integrada de ChatGPT, según la alternativa que el usuario comunicó del profesor.
Su carga se verificó. Las otras 49 películas conservan su imagen anterior.

## Cómo funciona y cómo explicarlo

- Gemini reescribe una sinopsis usando los datos existentes.
- `gemini-embedding-001` representa cada descripción como 768 números.
- Se guardan en SQLite como BinaryField, en float32 little endian.
- El modelo, dimensión y tarea SEMANTIC_SIMILARITY son iguales para película y consulta.
- El prompt del usuario se convierte en vector y se compara por coseno con el catálogo.
- Se muestra la película de mayor similitud. El puntaje no es una probabilidad.
- Si cambia la descripción, su embedding anterior deja de utilizarse hasta regenerarlo.
- No se mezclan embeddings de Gemini con embeddings de OpenAI.

Documentación: https://ai.google.dev/gemini-api/docs/embeddings
Precios/cuotas: https://ai.google.dev/gemini-api/docs/pricing
La guía del profesor menciona Gemini como opción para embeddings:
https://github.com/jdmartinev/TallerIA_PI/blob/main/7_movie_recommendations.md

## Verificación reproducible

```powershell
.\.venv\Scripts\python.exe manage.py test movie
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
```

Las pruebas simulan respuestas de la API; no consumen cuota ni demuestran acceso
real a Gemini. Cubren similitud, vectores inválidos, invalidación por cambios,
importación, reanudación, una única descripción, formularios, errores y páginas anteriores.

## Guion para el video (cuando las pruebas reales estén completas)

1. Presentar el objetivo y explicar el cambio de proveedor a Gemini gratuito.
2. Mostrar el catálogo y las descripciones actualizadas; distinguir las importadas
   de las generadas en la prueba. No afirmar que el CSV actualizó datos si no lo hizo.
3. Mostrar las ilustraciones importadas cuando se reciba el material.
4. Mostrar `show_embedding` y la comparación de dos películas con un prompt.
5. Abrir Recomendador IA, escribir dos búsquedas distintas y explicar los resultados.
6. Explicar que los vectores se almacenan y que solo la consulta necesita otro embedding.

Pendiente: material correcto de CSV e imágenes, completar capturas, video y publicación final.

## Copia transportable y video

`demo_data/catalogo.json` contiene únicamente películas y noticias, con los embeddings
ya calculados. No incluye usuarios, sesiones, contraseñas ni claves API.
`demo_data/media/` contiene las dos imágenes usadas: la predeterminada y la prueba de ChatGPT.
En otro computador con Python 3.12 o superior, abre `preparar_en_otro_equipo.cmd`;
el restaurador se niega a sobrescribir un catálogo existente. Para grabar y entregar
consulta `GUIA_GRABACION.md`. La alternativa al CSV del profesor sigue por confirmar.
