from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import UsuarioSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def obtener_csrf(request):
    """El frontend pega acá antes del login para recibir la cookie csrftoken."""
    get_token(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([AllowAny])
def iniciar_sesion(request):
    usuario = authenticate(
        request,
        username=request.data.get("username"),
        password=request.data.get("password"),
    )
    if usuario is None:
        return Response(
            {"detail": "Usuario o contraseña inválidos."}, status=status.HTTP_400_BAD_REQUEST
        )
    login(request, usuario)
    return Response(UsuarioSerializer(usuario).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cerrar_sesion(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def usuario_actual(request):
    return Response(UsuarioSerializer(request.user).data)
