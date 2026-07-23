from rest_framework import permissions, viewsets

from .models import (
    Carrera,
    Comision,
    Entrega,
    EntregaAlumno,
    InscripcionComision,
    Materia,
    Modulo,
    Recurso,
)
from .permissions import EsAdministrativoOSoloLectura, EsDocenteDeComisionOSoloLectura
from .serializers import (
    CarreraSerializer,
    ComisionSerializer,
    EntregaAlumnoSerializer,
    EntregaSerializer,
    InscripcionComisionSerializer,
    MateriaSerializer,
    ModuloSerializer,
    RecursoSerializer,
)


class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.select_related("carrera").all()
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]


class ComisionViewSet(viewsets.ModelViewSet):
    queryset = Comision.objects.select_related("materia", "docente").all()
    serializer_class = ComisionSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]


class ModuloViewSet(viewsets.ModelViewSet):
    queryset = Modulo.objects.select_related("comision").all()
    serializer_class = ModuloSerializer
    permission_classes = [permissions.IsAuthenticated, EsDocenteDeComisionOSoloLectura]


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.select_related("modulo__comision").all()
    serializer_class = RecursoSerializer
    permission_classes = [permissions.IsAuthenticated, EsDocenteDeComisionOSoloLectura]


class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.select_related("modulo__comision").all()
    serializer_class = EntregaSerializer
    permission_classes = [permissions.IsAuthenticated, EsDocenteDeComisionOSoloLectura]


class InscripcionComisionViewSet(viewsets.ModelViewSet):
    serializer_class = InscripcionComisionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = InscripcionComision.objects.select_related("alumno", "comision")
        if user.rol == "alumno":
            return qs.filter(alumno=user)
        if user.rol == "docente":
            return qs.filter(comision__docente=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)


class EntregaAlumnoViewSet(viewsets.ModelViewSet):
    serializer_class = EntregaAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = EntregaAlumno.objects.select_related("entrega__modulo__comision", "alumno")
        if user.rol == "alumno":
            return qs.filter(alumno=user)
        if user.rol == "docente":
            return qs.filter(entrega__modulo__comision__docente=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)
