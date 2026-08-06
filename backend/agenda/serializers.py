from django.conf import settings
from django.core.validators import FileExtensionValidator
from rest_framework import serializers
from rest_framework.reverse import reverse

from .models import EXTENSIONES_PERMITIDAS, Apunte, EventoCalendario


class EventoCalendarioSerializer(serializers.ModelSerializer):
    materia_nombre = serializers.CharField(source="materia.nombre", read_only=True, default=None)
    cantidad_apuntes = serializers.IntegerField(source="apuntes.count", read_only=True)

    class Meta:
        model = EventoCalendario
        fields = [
            "id",
            "materia",
            "materia_nombre",
            "titulo",
            "descripcion",
            "tipo",
            "fecha",
            "todo_el_dia",
            "hora_inicio",
            "hora_fin",
            "lugar",
            "repeticion",
            "repetir_hasta",
            "cantidad_apuntes",
        ]

    def validate(self, attrs):
        def valor(campo):
            if campo in attrs:
                return attrs[campo]
            return getattr(self.instance, campo, None)

        todo_el_dia = valor("todo_el_dia") or False
        inicio, fin = valor("hora_inicio"), valor("hora_fin")
        if todo_el_dia:
            attrs["hora_inicio"] = attrs["hora_fin"] = None
        else:
            if not inicio or not fin:
                raise serializers.ValidationError(
                    "Indicá hora de inicio y de fin, o marcá el evento como de todo el día."
                )
            if fin <= inicio:
                raise serializers.ValidationError(
                    "La hora de fin debe ser posterior a la de inicio."
                )

        repeticion = valor("repeticion") or EventoCalendario.Repeticion.NINGUNA
        repetir_hasta = valor("repetir_hasta")
        if repeticion == EventoCalendario.Repeticion.SEMANAL:
            if not repetir_hasta:
                raise serializers.ValidationError(
                    "Un evento semanal necesita una fecha hasta la cual repetirse."
                )
            if repetir_hasta < valor("fecha"):
                raise serializers.ValidationError(
                    "La fecha de fin de la repetición no puede ser anterior a la del evento."
                )
        else:
            attrs["repetir_hasta"] = None
        return attrs


class ApunteSerializer(serializers.ModelSerializer):
    materia_nombre = serializers.CharField(source="materia.nombre", read_only=True, default=None)
    evento_titulo = serializers.CharField(source="evento.titulo", read_only=True, default=None)
    autor = serializers.SerializerMethodField()
    es_propio = serializers.SerializerMethodField()
    archivo_url = serializers.SerializerMethodField()
    # Declarado a mano (write_only), así que hay que repetir el validador de
    # extensiones del modelo: DRF no hereda los del campo cuando se sobreescribe.
    archivo = serializers.FileField(
        write_only=True,
        required=False,
        allow_null=True,
        validators=[FileExtensionValidator(EXTENSIONES_PERMITIDAS)],
    )

    class Meta:
        model = Apunte
        fields = [
            "id",
            "materia",
            "materia_nombre",
            "evento",
            "evento_titulo",
            "titulo",
            "descripcion",
            "tipo",
            "archivo",
            "archivo_url",
            "nombre_archivo",
            "tamano_bytes",
            "enlace",
            "visibilidad",
            "autor",
            "es_propio",
            "creado_en",
        ]
        read_only_fields = ["nombre_archivo", "tamano_bytes", "creado_en"]

    def get_autor(self, apunte):
        return apunte.alumno.get_full_name() or apunte.alumno.username

    def get_es_propio(self, apunte):
        return apunte.alumno_id == self.context["request"].user.id

    def get_archivo_url(self, apunte):
        if not apunte.archivo:
            return None
        request = self.context["request"]
        return reverse("apunte-archivo", args=[apunte.pk], request=request)

    def validate_archivo(self, archivo):
        if archivo is None:
            return archivo
        maximo = settings.APUNTES_TAMANO_MAXIMO_MB * 1024 * 1024
        if archivo.size > maximo:
            raise serializers.ValidationError(
                f"El archivo supera el máximo de {settings.APUNTES_TAMANO_MAXIMO_MB} MB. "
                "Si es una grabación larga, subila a Drive/YouTube y guardá el enlace."
            )
        return archivo

    def validate_evento(self, evento):
        if evento and evento.alumno_id != self.context["request"].user.id:
            raise serializers.ValidationError("Ese evento del calendario no es tuyo.")
        return evento

    def validate(self, attrs):
        def valor(campo):
            if campo in attrs:
                return attrs[campo]
            return getattr(self.instance, campo, None)

        if not valor("archivo") and not valor("enlace"):
            raise serializers.ValidationError("Subí un archivo o pegá un enlace.")
        if valor("visibilidad") == Apunte.Visibilidad.COMISION and not valor("materia"):
            raise serializers.ValidationError(
                "Para compartir el apunte con la comisión tenés que elegir la materia."
            )
        return attrs

    def create(self, validated_data):
        archivo = validated_data.get("archivo")
        if archivo:
            validated_data["nombre_archivo"] = archivo.name
            validated_data["tamano_bytes"] = archivo.size
        return super().create(validated_data)

    def update(self, instance, validated_data):
        archivo = validated_data.get("archivo")
        if archivo:
            validated_data["nombre_archivo"] = archivo.name
            validated_data["tamano_bytes"] = archivo.size
        return super().update(instance, validated_data)


class ItemAgendaSerializer(serializers.Serializer):
    """Vista unificada del calendario: eventos propios + lo que ya vive en otros procesos.

    Es de solo lectura y se arma en memoria (ver AgendaView), no mapea a una tabla.
    """

    origen = serializers.CharField()
    id = serializers.IntegerField()
    titulo = serializers.CharField()
    descripcion = serializers.CharField(allow_blank=True)
    tipo = serializers.CharField()
    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField(allow_null=True)
    hora_fin = serializers.TimeField(allow_null=True)
    todo_el_dia = serializers.BooleanField()
    lugar = serializers.CharField(allow_blank=True)
    materia = serializers.IntegerField(allow_null=True)
    materia_nombre = serializers.CharField(allow_null=True)
    editable = serializers.BooleanField()
