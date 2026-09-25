# Taller 3 — adaptación a Gemini sin pagos

## Estado y alcance

El catálogo conserva las 50 películas anteriores y añade los 100 títulos del CSV
docente. Sus descripciones se importan literalmente; no se inventan año ni género.
La carpeta evidencias/taller3 contiene las verificaciones y capturas reales.
La copia original permanece en C:\Users\USUARIO\moviereviewsproject.

La prueba de una descripción utiliza Gemini gratuito. La prueba de una imagen
utiliza ChatGPT, alternativa comunicada por el usuario como autorizada por el profesor.
La carga completa de las imágenes docentes queda pendiente: su enlace no es accesible.
No se afirma que una imagen sustituya ese requisito ni que esté dispensado.

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
# Genera hasta 5 embeddings faltantes. Repite para completar el catálogo:
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

## Materiales del profesor

### Descripciones

Fuente del CSV conservado sin modificar:
https://github.com/jdmartinev/TallerIA_PI/blob/main/aux_files/updated_movie_descriptions.csv

Se añadieron sus 100 títulos porque no coincidían con los 50 originales. No se
reemplazaron películas ni se asignaron sinopsis a títulos distintos. Las descripciones
son material suministrado para el ejercicio; no se verificaron como reseñas históricas.
El importador se puede repetir sin duplicar títulos y conserva los embeddings si
el texto no cambia. Solo invalida el vector de una descripción modificada.

```powershell
.\.venv\Scripts\python.exe manage.py update_movies_from_csv --create-missing
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
Su carga se verificó. Las otras 149 películas usan la imagen predeterminada; no son ilustraciones generadas.

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
   de las generadas en la prueba. Mostrar Carmencita como ejemplo del material importado.
3. Mostrar las ilustraciones importadas cuando se reciba el material.
4. Mostrar `show_embedding` y la comparación de dos películas con un prompt.
5. Abrir Recomendador IA, escribir dos búsquedas distintas y explicar los resultados.
6. Explicar que los vectores se almacenan y que solo la consulta necesita otro embedding.

Pendiente externo: carpeta de imágenes del profesor. Pendiente de entrega: video público, envío del formulario y publicación de cambios.

## Copia transportable y video

`demo_data/catalogo.json` contiene únicamente películas y noticias, con los embeddings
ya calculados. No incluye usuarios, sesiones, contraseñas ni claves API.
`demo_data/media/` contiene las dos imágenes usadas: la predeterminada y la prueba de ChatGPT.
En otro computador con Python 3.12 o superior, abre `preparar_en_otro_equipo.cmd`;
el restaurador se niega a sobrescribir un catálogo existente. Para grabar y entregar
consulta `GUIA_GRABACION.md`. El CSV ya se incorporó ampliando el catálogo y conservando las películas anteriores.

## Comprobación final del catálogo ampliado

15 pruebas aprobadas. Auditoría: 150 películas, 100 descripciones docentes coincidentes,
150 embeddings actuales y cero archivos de imagen ausentes. Una ilustración generada
con ChatGPT; las restantes son predeterminadas. Ejecuta `manage.py verify_taller3`
para repetir la auditoría sin consumir API. Consulta ESTADO_ENTREGA.md para los pendientes.
