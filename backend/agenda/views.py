from datetime import date, datetime, time, timedelta

from django.db.models import Q
from django.http import FileResponse
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from cursos.models import Comision, Entrega, InscripcionComision
from productividad.models import BloqueEstudio
from tramites.models import InscripcionMesa

from .models import Apunte, EventoCalendario
from .permissions import EsPropietario, EsPropietarioOLectura
from .serializers import ApunteSerializer, EventoCalendarioSerializer, ItemAgendaSerializer

RANGO_MAXIMO_DIAS = 400


def materias_del_usuario(user):
    """Materias que el usuario cursa (alumno) o dicta (docente).

    Delimita qué apuntes compartidos puede ver: los de sus propias materias.
    """
    cursadas = InscripcionComision.objects.filter(
        alumno=user, estado=InscripcionComision.Estado.ACTIVA
    ).values_list("comision__materia_id", flat=True)
    dictadas = Comision.objects.filter(docente=user).values_list("materia_id", flat=True)
    return set(cursadas) | set(dictadas)


class EventoCalendarioViewSet(viewsets.ModelViewSet):
    serializer_class = EventoCalendarioSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return EventoCalendario.objects.filter(alumno=self.request.user).select_related("materia")

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)


class ApunteViewSet(viewsets.ModelViewSet):
    serializer_class = ApunteSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietarioOLectura]

    def get_queryset(self):
        user = self.request.user
        qs = Apunte.objects.filter(
            Q(alumno=user)
            | Q(visibilidad=Apunte.Visibilidad.COMISION, materia_id__in=materias_del_usuario(user))
        ).select_related("alumno", "materia", "evento")

        propios = self.request.query_params.get("propios")
        if propios == "true":
            qs = qs.filter(alumno=user)
        elif propios == "false":
            qs = qs.exclude(alumno=user)

        for campo in ("materia", "evento", "tipo"):
            valor = self.request.query_params.get(campo)
            if valor:
                qs = qs.filter(**{campo: valor})
        return qs

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)

    def perform_destroy(self, instance):
        instance.archivo.delete(save=False)
        instance.delete()

    @action(detail=True)
    def archivo(self, request, pk=None):
        """Descarga/reproducción del archivo.

        Los archivos no se sirven desde MEDIA_URL: pasan por acá para que valgan
        los permisos del apunte (propio o compartido con la comisión).
        """
        apunte = self.get_object()
        if not apunte.archivo:
            raise NotFound("Este apunte no tiene archivo, solo un enlace.")
        return FileResponse(
            apunte.archivo.open("rb"),
            as_attachment=True,
            filename=apunte.nombre_archivo or apunte.archivo.name.rsplit("/", 1)[-1],
        )


class AgendaView(APIView):
    """Calendario unificado del alumno, de solo lectura.

    Junta los eventos propios (los únicos editables desde acá) con lo que ya
    generan los otros procesos: bloques de estudio del planificador (Proceso
    02), fechas límite de entregas (Proceso 01) y mesas de examen en las que
    está inscripto (Proceso 03).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        desde, hasta = self._rango(request)
        items = [
            *self._eventos(request.user, desde, hasta),
            *self._bloques_estudio(request.user, desde, hasta),
            *self._entregas(request.user, desde, hasta),
            *self._mesas_examen(request.user, desde, hasta),
        ]
        items.sort(key=lambda item: (item["fecha"], item["hora_inicio"] or time.min))
        return Response(ItemAgendaSerializer(items, many=True).data)

    def _rango(self, request):
        hoy = date.today()
        inicio_de_mes = hoy.replace(day=1)
        desde = self._fecha(request, "desde", inicio_de_mes)
        hasta = self._fecha(request, "hasta", inicio_de_mes + timedelta(days=41))
        if hasta < desde:
            raise ValidationError("El parámetro 'hasta' no puede ser anterior a 'desde'.")
        if (hasta - desde).days > RANGO_MAXIMO_DIAS:
            raise ValidationError(f"El rango no puede superar los {RANGO_MAXIMO_DIAS} días.")
        return desde, hasta

    def _fecha(self, request, parametro, por_defecto):
        valor = request.query_params.get(parametro)
        if not valor:
            return por_defecto
        try:
            return datetime.strptime(valor, "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError(f"'{parametro}' debe tener formato AAAA-MM-DD.")

    def _eventos(self, user, desde, hasta):
        eventos = (
            EventoCalendario.objects.filter(alumno=user, fecha__lte=hasta)
            .filter(Q(fecha__gte=desde) | Q(repetir_hasta__gte=desde))
            .select_related("materia")
        )
        return [
            {
                "origen": "evento",
                "id": evento.id,
                "titulo": evento.titulo,
                "descripcion": evento.descripcion,
                "tipo": evento.tipo,
                "fecha": fecha,
                "hora_inicio": evento.hora_inicio,
                "hora_fin": evento.hora_fin,
                "todo_el_dia": evento.todo_el_dia,
                "lugar": evento.lugar,
                "materia": evento.materia_id,
                "materia_nombre": evento.materia.nombre if evento.materia else None,
                "editable": True,
            }
            for evento in eventos
            for fecha in evento.ocurrencias(desde, hasta)
        ]

    def _bloques_estudio(self, user, desde, hasta):
        bloques = BloqueEstudio.objects.filter(
            alumno=user, fecha__range=(desde, hasta)
        ).select_related("materia")
        return [
            {
                "origen": "bloque_estudio",
                "id": bloque.id,
                "titulo": f"Bloque de {bloque.get_tipo_display().lower()}",
                "descripcion": f"Estado: {bloque.get_estado_display()}",
                "tipo": bloque.tipo,
                "fecha": bloque.fecha,
                "hora_inicio": bloque.hora_inicio,
                "hora_fin": bloque.hora_fin,
                "todo_el_dia": False,
                "lugar": "",
                "materia": bloque.materia_id,
                "materia_nombre": bloque.materia.nombre if bloque.materia else None,
                "editable": False,
            }
            for bloque in bloques
        ]

    def _entregas(self, user, desde, hasta):
        entregas = Entrega.objects.filter(
            fecha_limite__range=(desde, hasta),
            modulo__comision__inscripciones__alumno=user,
            modulo__comision__inscripciones__estado=InscripcionComision.Estado.ACTIVA,
        ).select_related("modulo__comision__materia")
        return [
            {
                "origen": "entrega",
                "id": entrega.id,
                "titulo": entrega.titulo,
                "descripcion": entrega.descripcion,
                "tipo": "entrega",
                "fecha": entrega.fecha_limite,
                "hora_inicio": None,
                "hora_fin": None,
                "todo_el_dia": True,
                "lugar": "",
                "materia": entrega.modulo.comision.materia_id,
                "materia_nombre": entrega.modulo.comision.materia.nombre,
                "editable": False,
            }
            for entrega in entregas
        ]

    def _mesas_examen(self, user, desde, hasta):
        inscripciones = InscripcionMesa.objects.filter(
            alumno=user,
            estado=InscripcionMesa.Estado.INSCRIPTO,
            mesa__fecha__range=(desde, hasta),
        ).select_related("mesa__materia")
        return [
            {
                "origen": "mesa_examen",
                "id": inscripcion.mesa_id,
                "titulo": f"Mesa de {inscripcion.mesa.get_tipo_display().lower()}: "
                f"{inscripcion.mesa.materia.nombre}",
                "descripcion": "",
                "tipo": inscripcion.mesa.tipo,
                "fecha": inscripcion.mesa.fecha,
                "hora_inicio": None,
                "hora_fin": None,
                "todo_el_dia": True,
                "lugar": "",
                "materia": inscripcion.mesa.materia_id,
                "materia_nombre": inscripcion.mesa.materia.nombre,
                "editable": False,
            }
            for inscripcion in inscripciones
        ]
