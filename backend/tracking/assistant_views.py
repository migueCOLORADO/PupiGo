from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .assistant import MAX_QUESTION_CHARS, answer


class AssistantView(APIView):
    """POST /api/assistant/ {question} -> {answer, source: "ai"|"fallback", notice}  UH10"""

    def post(self, request):
        question = request.data.get("question") if hasattr(request.data, "get") else None
        if not isinstance(question, str) or not question.strip():
            return Response({"detail": "Escribe una pregunta."}, status=status.HTTP_400_BAD_REQUEST)
        question = question.strip()
        if len(question) > MAX_QUESTION_CHARS:
            return Response({"detail": f"La pregunta no puede superar {MAX_QUESTION_CHARS} caracteres."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            return Response(answer(question))
        except Exception:
            # NFR #122: el asistente nunca debe tumbar la API del colectivo.
            return Response({
                "answer": "No pude consultar los datos del colectivo en este momento. El mapa y el estado siguen disponibles.",
                "source": "fallback",
                "notice": "El asistente no está disponible.",
            })
