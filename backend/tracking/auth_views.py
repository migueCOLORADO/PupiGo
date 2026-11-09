from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import role_of


class LoginView(APIView):
    """POST /api/auth/login/ {username, password} -> {token, username, role}   RF #131"""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data if hasattr(request.data, "get") else {}
        username, password = data.get("username"), data.get("password")
        user = None
        if isinstance(username, str) and isinstance(password, str):
            user = authenticate(request, username=username, password=password)
        if user is None:
            # Misma respuesta para usuario inexistente y clave mala (escenario 2).
            return Response({"detail": "Credenciales invalidas."}, status=status.HTTP_400_BAD_REQUEST)
        role = role_of(user)
        if role is None:
            return Response({"detail": "Esta cuenta no tiene acceso."}, status=status.HTTP_403_FORBIDDEN)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.get_username(), "role": role})


class LogoutView(APIView):
    """POST /api/auth/logout/ -> 204, invalida el token   RF #133"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET /api/auth/me/ -> {username, role}"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"username": request.user.get_username(), "role": role_of(request.user)})
