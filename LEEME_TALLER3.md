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

## Generación de imágenes integrada
Ejecuta Configurar Hugging Face.cmd una vez para guardar HF_TOKEN localmente.
Requiere cuenta gratuita sin créditos comprados ni claves de proveedores externos.
La confirmación local no impone un límite de facturación en el proveedor.

```powershell
.\.venv\Scripts\python.exe manage.py update_images --movie-id 4
```

Cada ejecución solicita UNA imagen a FLUX.1-schnell mediante Hugging Face/Nscale,
guarda un PNG con nombre único y actualiza la película. Conserva la imagen anterior
y un registro sin credenciales en evidencias/taller3/hf_*.json. No ejecuta un lote.
Si se agotan los créditos, detente: no es necesario activar pagos. Cada repetición
consume cuota; para mostrar la imagen ya guardada no se requiere una nueva petición.

Prueba real 27/09/2026: película 4, PNG 512x768 guardado y asociado correctamente.
El modelo añadió texto aunque el prompt pidió no hacerlo; se conserva la salida real.
La imagen anterior de ChatGPT queda como antecedente. El archivo del profesor era
material de ejemplo según su aclaración; ya no bloquea la integración.

Restan renovar evidencias visuales del catálogo de diez y de la nueva imagen,
grabar/publicar el video y enviar el formulario. Las capturas con 150 son históricas.
