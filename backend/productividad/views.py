from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Autoevaluacion,
    BloqueEstudio,
    Habito,
    ItemRepaso,
    PreguntaAutoevaluacion,
    Recordatorio,
    RegistroHabito,
    SesionRepaso,
)
from .permissions import EsPropietario
from .serializers import (
    AutoevaluacionSerializer,
    BloqueEstudioSerializer,
    HabitoSerializer,
    ItemRepasoSerializer,
    PreguntaAutoevaluacionSerializer,
    RecordatorioSerializer,
    RegistroHabitoSerializer,
    SesionRepasoSerializer,
)


class BloqueEstudioViewSet(viewsets.ModelViewSet):
    serializer_class = BloqueEstudioSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return BloqueEstudio.objects.filter(alumno=self.request.user)

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)


class HabitoViewSet(viewsets.ModelViewSet):
    serializer_class = HabitoSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return Habito.objects.filter(alumno=self.request.user)

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)


class RegistroHabitoViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroHabitoSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        qs = RegistroHabito.objects.filter(habito__alumno=self.request.user)
        habito_id = self.request.query_params.get("habito")
        if habito_id:
            qs = qs.filter(habito_id=habito_id)
        fecha = self.request.query_params.get("fecha")
        if fecha:
            qs = qs.filter(fecha=fecha)
        return qs


class ItemRepasoViewSet(viewsets.ModelViewSet):
    serializer_class = ItemRepasoSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return ItemRepaso.objects.filter(alumno=self.request.user)

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)

    @action(detail=False)
    def pendientes(self, request):
        hoy = timezone.localdate()
        qs = self.get_queryset().filter(proxima_fecha_repaso__lte=hoy)
        return Response(self.get_serializer(qs, many=True).data)


class SesionRepasoViewSet(viewsets.ModelViewSet):
    serializer_class = SesionRepasoSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return SesionRepaso.objects.filter(item_repaso__alumno=self.request.user)


class AutoevaluacionViewSet(viewsets.ModelViewSet):
    serializer_class = AutoevaluacionSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return Autoevaluacion.objects.filter(alumno=self.request.user).prefetch_related("preguntas")

    def perform_create(self, serializer):
        serializer.save(alumno=self.request.user)


class PreguntaAutoevaluacionViewSet(viewsets.ModelViewSet):
    serializer_class = PreguntaAutoevaluacionSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return PreguntaAutoevaluacion.objects.filter(autoevaluacion__alumno=self.request.user)


class RecordatorioViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecordatorioSerializer
    permission_classes = [permissions.IsAuthenticated, EsPropietario]

    def get_queryset(self):
        return Recordatorio.objects.filter(alumno=self.request.user)

    @action(detail=True, methods=["post"])
    def marcar_leido(self, request, pk=None):
        recordatorio = self.get_object()
        recordatorio.estado = Recordatorio.Estado.LEIDO
        recordatorio.save(update_fields=["estado"])
        return Response(self.get_serializer(recordatorio).data)
