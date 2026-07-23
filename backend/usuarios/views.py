from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Usuario
from .permissions import EsAdministrativo
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


class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    """Solo para que administrativo pueda elegir a quién asignar (ej. el docente de una comisión)."""

    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, EsAdministrativo]
    pagination_class = None

    def get_queryset(self):
        qs = Usuario.objects.all().order_by("first_name", "last_name", "username")
        rol = self.request.query_params.get("rol")
        if rol:
            qs = qs.filter(rol=rol)
        return qs
