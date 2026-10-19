# UH10: Asistente con IA para consultas del colectivo

Feature 10 (#118), UH10 (#119). Responsable: migueCOLORADO. Módulo: Backend.

## Criterios de aceptación y cómo se cumplen

| Criterio (issue) | Cómo se cumple | Prueba |
|---|---|---|
| RF #120: responder en lenguaje natural sobre estado, ubicación y dirección | `POST /api/assistant/` recibe la pregunta y devuelve `answer` en español. Con IA: Claude redacta la respuesta. Sin IA: respuesta automática con estado, dirección, distancia al destino, hora de la última posición, conductor y placa | `test_ai_answer_receives_real_data`, `test_fallback_uses_real_trip_data` |
| RF #121: basar las respuestas en datos reales | `build_context()` lee solo la base (recorrido activo, última posición, ruta, conductor, vehículo). A la IA se le envía ese bloque DATOS con la regla de no inventar. Si falta un dato, la respuesta lo dice | `test_ai_answer_receives_real_data` (verifica que la placa va en lo enviado), `test_waiting_trip_without_gps` |
| Escenario: sin recorrido activo | Indica que no hay recorrido en curso e informa la última posición conocida si existe | `test_no_active_trip_reports_last_known_position`, `test_no_active_trip_without_positions` |
| Escenario: pregunta fuera de alcance | Responde "Solo puedo responder preguntas sobre el colectivo EAFIT-Metro." (regla en el prompt de la IA y filtro por palabras en el modo respaldo) | `test_out_of_scope_question_in_fallback` |
| NFR #122: el sistema funciona sin IA | Sin llave, error de red, HTTP de error, timeout, respuesta vacía o `refusal`: el endpoint responde 200 con `source: "fallback"` y un aviso. Nunca 500. La API de recorridos no se ve afectada. En el frontend, el panel muestra un aviso y el mapa y el estado siguen funcionando | `test_provider_error_falls_back`, `test_provider_http_error_and_timeout_fall_back`, `test_invalid_or_refused_ai_response_falls_back`, `test_unexpected_error_never_500`, `test_trip_api_unaffected` |
| NFR #123: respuesta en máximo 10 s | Timeout de 8 s a la llamada de IA; vencido, responde con el respaldo | `test_ai_answer_receives_real_data` (verifica timeout <= 10 s) |
| Validación | Pregunta vacía, no texto o de más de 300 caracteres: 400 con mensaje claro | `test_invalid_question` |

## API

`POST /api/assistant/` con cuerpo `{"question": "¿Dónde está el colectivo?"}`.

Respuesta 200: `{"answer": "...", "source": "ai" | "fallback", "notice": null | "..."}`.

## Variables de entorno (`backend/.env`, no se sube al repo)

| Variable | Uso |
|---|---|
| `ASSISTANT_API_KEY` | Llave de la API de Anthropic (Claude) |
| `ASSISTANT_MODEL` | ID del modelo de Claude. Sin valor por defecto. POR CONFIRMAR por el equipo |

Si falta cualquiera de las dos, la IA queda desactivada y el asistente responde en modo respaldo. Plantilla: `backend/.env.example`.

## Cómo probar

Sin llave (modo respaldo):
1. `cd backend && python manage.py runserver 8000` y `cd frontend && npm run dev`.
2. Abrir http://localhost:5173/, panel "Pregúntale al asistente", preguntar "¿Dónde está el colectivo?".
3. Esperado: aviso amarillo "Asistente de IA desactivado..." y respuesta con los datos del sistema.
4. Desde http://localhost:5173/conductor poner un recorrido en espera e iniciarlo; volver a preguntar: la respuesta incluye estado, dirección, distancia al destino, conductor y placa.

Con llave:
1. Crear `backend/.env` con `ASSISTANT_API_KEY` y `ASSISTANT_MODEL`, y reiniciar `runserver`.
2. Repetir las preguntas. Esperado: respuesta redactada, con el texto "Respuesta generada con IA a partir de los datos del sistema".
3. Probar "¿Cuál es la capital de Francia?". Esperado: "Solo puedo responder preguntas sobre el colectivo EAFIT-Metro."

Pruebas automáticas: `cd backend && python manage.py test` (la IA se simula; no usan red ni llave).

## Limitaciones

- No hay paradas intermedias en la base (solo origen y destino de la ruta): el asistente no responde por el paradero de La Aguacatala.
- La distancia al destino es en línea recta, no por la vía.
- El modo respaldo no interpreta la pregunta: responde con el resumen completo del recorrido (o con el mensaje de fuera de alcance si no menciona el servicio).
- El filtro de alcance del respaldo es por palabras clave; una pregunta válida redactada sin esas palabras recibe el mensaje de fuera de alcance.
- La llamada real a la API con llave no se probó en esta entrega (solo simulada).
