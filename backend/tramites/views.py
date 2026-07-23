from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from cursos.models import InscripcionComision
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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def legajo_academico(request):
    """El legajo no es una tabla: se arma acá combinando inscripcion_comision
    (aprobada) e inscripcion_mesa (aprobado) del alumno logueado. Ver
    docs/procesos/03-mesas-legajo-tramites.md."""
    alumno = request.user
    entradas = []

    for insc in InscripcionComision.objects.filter(
        alumno=alumno, estado=InscripcionComision.Estado.APROBADA
    ).select_related("comision__materia"):
        entradas.append(
            {
                "materia_codigo": insc.comision.materia.codigo,
                "materia_nombre": insc.comision.materia.nombre,
                "origen": "comision",
                "periodo": insc.comision.periodo,
                "nota": None,
            }
        )

    for im in InscripcionMesa.objects.filter(
        alumno=alumno, estado=InscripcionMesa.Estado.APROBADO
    ).select_related("mesa__materia"):
        entradas.append(
            {
                "materia_codigo": im.mesa.materia.codigo,
                "materia_nombre": im.mesa.materia.nombre,
                "origen": "mesa",
                "periodo": im.mesa.fecha.isoformat(),
                "nota": str(im.nota) if im.nota is not None else None,
            }
        )

    entradas.sort(key=lambda e: e["materia_codigo"])
    return Response(entradas)
