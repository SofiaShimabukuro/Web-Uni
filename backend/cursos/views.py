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
    """Catálogo de referencia (pocas decenas de filas): sin paginar, para poblar selects."""

    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]
    pagination_class = None


class MateriaViewSet(viewsets.ModelViewSet):
    """Catálogo de referencia (una malla completa, ~50 filas): sin paginar, para poblar selects."""

    queryset = Materia.objects.select_related("carrera").all()
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]
    pagination_class = None


class ComisionViewSet(viewsets.ModelViewSet):
    serializer_class = ComisionSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrativoOSoloLectura]

    def get_queryset(self):
        qs = Comision.objects.select_related("materia", "docente")
        user = self.request.user
        if user.rol == "docente":
            qs = qs.filter(docente=user)
        elif user.rol == "alumno":
            qs = qs.filter(inscripciones__alumno=user)
        return qs.distinct()


class ModuloViewSet(viewsets.ModelViewSet):
    serializer_class = ModuloSerializer
    permission_classes = [permissions.IsAuthenticated, EsDocenteDeComisionOSoloLectura]

    def get_queryset(self):
        qs = Modulo.objects.select_related("comision")
        user = self.request.user
        if user.rol == "docente":
            qs = qs.filter(comision__docente=user)
        elif user.rol == "alumno":
            qs = qs.filter(comision__inscripciones__alumno=user)
        comision_id = self.request.query_params.get("comision")
        if comision_id:
            qs = qs.filter(comision_id=comision_id)
        return qs.distinct()


class RecursoViewSet(viewsets.ModelViewSet):
    serializer_class = RecursoSerializer
    permission_classes = [permissions.IsAuthenticated, EsDocenteDeComisionOSoloLectura]

    def get_queryset(self):
        qs = Recurso.objects.select_related("modulo__comision")
        user = self.request.user
        if user.rol == "docente":
            qs = qs.filter(modulo__comision__docente=user)
        elif user.rol == "alumno":
            qs = qs.filter(modulo__comision__inscripciones__alumno=user)
        modulo_id = self.request.query_params.get("modulo")
        if modulo_id:
            qs = qs.filter(modulo_id=modulo_id)
        return qs.distinct()


class EntregaViewSet(viewsets.ModelViewSet):
    serializer_class = EntregaSerializer
    permission_classes = [permissions.IsAuthenticated, EsDocenteDeComisionOSoloLectura]

    def get_queryset(self):
        qs = Entrega.objects.select_related("modulo__comision")
        user = self.request.user
        if user.rol == "docente":
            qs = qs.filter(modulo__comision__docente=user)
        elif user.rol == "alumno":
            qs = qs.filter(modulo__comision__inscripciones__alumno=user)
        modulo_id = self.request.query_params.get("modulo")
        if modulo_id:
            qs = qs.filter(modulo_id=modulo_id)
        return qs.distinct()


class InscripcionComisionViewSet(viewsets.ModelViewSet):
    serializer_class = InscripcionComisionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = InscripcionComision.objects.select_related("alumno", "comision")
        if user.rol == "alumno":
            qs = qs.filter(alumno=user)
        elif user.rol == "docente":
            qs = qs.filter(comision__docente=user)
        comision_id = self.request.query_params.get("comision")
        if comision_id:
            qs = qs.filter(comision_id=comision_id)
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
            qs = qs.filter(alumno=user)
        elif user.rol == "docente":
            qs = qs.filter(entrega__modulo__comision__docente=user)
        entrega_id = self.request.query_params.get("entrega")
        if entrega_id:
            qs = qs.filter(entrega_id=entrega_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)
