from rest_framework import permissions, viewsets

from cursos.permissions import EsAdministrativoOSoloLectura

from .models import InscripcionMesa, MesaExamen, SolicitudTramite
from .serializers import InscripcionMesaSerializer, MesaExamenSerializer, SolicitudTramiteSerializer


class MesaExamenViewSet(viewsets.ModelViewSet):
    """Convocatoria a mesas: solo administrativo las crea. Lectura: cualquier autenticado
    (el alumno necesita ver qué mesas hay disponibles para anotarse)."""

    queryset = MesaExamen.objects.select_related("materia", "docente").all()
    serializer_class = MesaExamenSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]


class InscripcionMesaViewSet(viewsets.ModelViewSet):
    serializer_class = InscripcionMesaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = InscripcionMesa.objects.select_related("mesa__materia", "mesa__docente", "alumno")
        user = self.request.user
        if user.rol == "alumno":
            qs = qs.filter(alumno=user)
        elif user.rol == "docente":
            qs = qs.filter(mesa__docente=user)
        mesa_id = self.request.query_params.get("mesa")
        if mesa_id:
            qs = qs.filter(mesa_id=mesa_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)


class SolicitudTramiteViewSet(viewsets.ModelViewSet):
    serializer_class = SolicitudTramiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = SolicitudTramite.objects.select_related("alumno")
        if self.request.user.rol == "alumno":
            qs = qs.filter(alumno=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)
