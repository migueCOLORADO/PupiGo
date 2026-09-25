# Verificación real — 24 de septiembre de 2026

## Datos y acceso

- Proyecto Google AI Studio Taller3-Peliculas: nivel gratuito observado en la interfaz.
- No se activó facturación ni se compraron créditos.
- 50 películas; 50 embeddings actuales de 768 dimensiones.
- Modelo de embeddings: gemini-embedding-001, SEMANTIC_SIMILARITY.
- Descripción de The Shawshank Redemption generada con gemini-3.1-flash-lite.
- Los intentos con otros modelos de texto devolvieron 404/503; no se presentaron como éxitos.
- 13 pruebas automáticas aprobadas tras el ajuste de la integración.

## Descripción generada

The Shawshank Redemption (1994) narra la historia de dos hombres encarcelados que,
a lo largo de los años, forjan una profunda amistad. En medio de las dificultades
de la vida en prisión, ambos encuentran consuelo y redención el uno en el otro.

## Comparación por consola

Comando: `movie_similarities 4 5 "Una historia sobre crimen y familia"`

| Comparación | Similitud coseno |
|---|---:|
| The Shawshank Redemption / The Godfather | 0.6753 |
| Prompt / The Shawshank Redemption | 0.7382 |
| Prompt / The Godfather | 0.8304 |

## Pruebas en la página web con llamadas reales

Página: http://127.0.0.1:8001/recommendations/

| Entrada | Resultado visible | Similitud |
|---|---|---:|
| Una historia de una familia mafiosa y el poder del crimen organizado | The Godfather | 0.8512 |
| Un astronauta debe sobrevivir solo en Marte y encontrar una forma de regresar a la Tierra | Avatar | 0.8237 |
| Un pez padre recorre el océano para rescatar a su hijo | Finding Nemo | 0.9240 |

La consulta de Marte ilustra una limitación: The Martian no está en el catálogo.
El algoritmo devuelve la mayor similitud disponible, no detecta si existe una
coincidencia exacta. La puntuación no representa certeza ni calidad de la película.

## Ejemplo de embedding real mostrado por show_embedding

Película: Fight Club. Modelo: gemini-embedding-001. Dimensión: 768.
Primeros valores:

```text
(-0.0125333881, 0.0029219314, 0.0223207679, -0.0724973455,
 -0.0034128686, 0.0091405641, 0.0181431659, 0.0080905370,
  0.0026289378, 0.0159396194)
```

## Pendientes que impiden considerar el taller completo

1. El CSV del profesor tiene 100 títulos, ninguno coincide con las 50 películas locales.
   El importador está probado; no se falseó una importación exitosa.
2. El enlace de las imágenes del profesor devuelve falta de acceso. Se conserva
   la imagen anterior de las películas; no se atribuye su generación a Gemini.
3. Faltan las capturas finales de importación e imágenes y el video de entrega.
4. Los cambios están en la copia de trabajo, no publicados en la rama de GitHub.

Esta es una bitácora escrita de verificación, no sustituye las capturas pedidas.

## Prueba de imagen con ChatGPT
El usuario comunica autorización del profesor para generar imágenes con ChatGPT mientras corrige el enlace. Se creó una ilustración original de dos presos en un patio, representando amistad y esperanza, para The Shawshank Redemption. Archivo: media/movie/images/m_The Shawshank Redemption.png. PNG 1024x1536. Importación real: 1 imagen asignada, 49 pendientes. Carga verificada en navegador (naturalWidth 1024 y naturalHeight 1536). La imagen anterior no se eliminó; su referencia está en imagen_prueba_respaldo.json. Se utilizó la herramienta integrada de generación, no una llamada a la API de imágenes de Gemini/OpenAI. Esta prueba completa una imagen, no todas las ilustraciones del catálogo.


## Actualización de cierre técnico — 25 de septiembre de 2026

- Se amplió el catálogo con las 100 filas del CSV docente: 150 películas en total.
- Auditoría: 100/100 descripciones coinciden literalmente con el CSV, 150/150 embeddings actuales y ningún archivo de imagen referenciado ausente.
- Una ilustración específica generada con ChatGPT; 149 imágenes predeterminadas. La carga completa de imágenes docentes permanece pendiente.
- Prueba web con catálogo completo: «Un pez padre recorre el océano para rescatar a su hijo» devuelve Finding Nemo, 0.9240.
- 15 pruebas automáticas aprobadas; check sin errores y migraciones al día.
- Capturas reales: 01_imagen_chatgpt.png, 02_descripcion_csv.png, 07_recomendacion_150.png.
- Salidas reales: 03_embedding_real.txt, 04_csv_reejecucion.txt, 05_importacion_imagenes.txt, 06_similitudes_reales.txt, 08_verificacion_catalogo.json.
- El registro anterior se conserva como historial. Quedan resueltos su pendiente de CSV y las capturas de la prueba; no se ha grabado/publicado video ni enviado el formulario.
