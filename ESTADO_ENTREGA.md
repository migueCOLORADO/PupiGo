# Estado de entrega — selección de 10 películas

- Catálogo reducido por solicitud del usuario, con respaldo de los 150 registros.
- Diez embeddings conservados. Siete títulos originales y tres del CSV docente.
- Importación parcial documentada mediante descripciones_seleccion_10.csv.
- Recomendador y comparación disponibles; falta renovar la captura del recomendador
  para mostrar 10 de 10 y la captura de show_embedding con una película actual.
- Generación real completada desde Django con Hugging Face/Nscale y FLUX.1-schnell.
  Imagen 512x768 asociada a The Shawshank Redemption; registro hf_4_c13c8cf82dcd.json.
  Falta guardar captura de la nueva imagen en la interfaz.
- Ya no se espera la carpeta del profesor: aclaró que era material de ejemplo.
- Pendiente final: grabar y publicar video de funcionamiento, comprobar acceso y
  enviar correo, nombre y enlace al formulario https://forms.gle/BFvZSuuoKKHP4k8b6.
- Esta selección de diez películas es una adaptación del proyecto, no una cantidad
  expresamente exigida ni aprobada como mínimo por el profesor.

## Evidencias actualizadas recibidas el 27/09/2026
Las capturas 13 a 16 documentan la descripción en admin, la imagen de Hugging Face en la interfaz, el embedding de The Godfather (768 dimensiones) y el recomendador con 10/10 películas (Finding Nemo, 0.9247). Quedan resueltos los pendientes de capturas indicados anteriormente. Nueve películas aún usan imagen predeterminada. El video y el formulario siguen pendientes.


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
