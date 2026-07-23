from rest_framework import serializers

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


class BloqueEstudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueEstudio
        fields = ["id", "materia", "tipo", "fecha", "hora_inicio", "hora_fin", "estado"]

    def validate(self, attrs):
        inicio = attrs.get("hora_inicio", getattr(self.instance, "hora_inicio", None))
        fin = attrs.get("hora_fin", getattr(self.instance, "hora_fin", None))
        if inicio and fin and fin <= inicio:
            raise serializers.ValidationError("La hora de fin debe ser posterior a la de inicio.")
        return attrs


class HabitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habito
        fields = ["id", "nombre", "frecuencia", "activo"]


class RegistroHabitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroHabito
        fields = ["id", "habito", "fecha", "cumplido"]

    def validate_habito(self, habito):
        if habito.alumno_id != self.context["request"].user.id:
            raise serializers.ValidationError("Ese hábito no es tuyo.")
        return habito


class ItemRepasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemRepaso
        fields = [
            "id",
            "materia",
            "recurso",
            "pregunta",
            "respuesta",
            "facilidad",
            "intervalo_dias",
            "repeticiones",
            "proxima_fecha_repaso",
        ]
        read_only_fields = ["facilidad", "intervalo_dias", "repeticiones", "proxima_fecha_repaso"]


class SesionRepasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SesionRepaso
        fields = ["id", "item_repaso", "fecha", "calificacion"]
        read_only_fields = ["fecha"]

    def validate_item_repaso(self, item_repaso):
        if item_repaso.alumno_id != self.context["request"].user.id:
            raise serializers.ValidationError("Ese item de repaso no es tuyo.")
        return item_repaso

    def create(self, validated_data):
        sesion = super().create(validated_data)
        sesion.item_repaso.aplicar_calificacion(sesion.calificacion)
        return sesion


class PreguntaAutoevaluacionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaAutoevaluacion
        fields = ["enunciado", "respuesta_correcta"]


class PreguntaAutoevaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaAutoevaluacion
        fields = [
            "id",
            "autoevaluacion",
            "enunciado",
            "respuesta_correcta",
            "respuesta_alumno",
            "es_correcta",
        ]
        read_only_fields = ["autoevaluacion", "enunciado", "respuesta_correcta", "es_correcta"]

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        if instance.respuesta_alumno:
            instance.es_correcta = (
                instance.respuesta_alumno.strip().lower()
                == instance.respuesta_correcta.strip().lower()
            )
            instance.save(update_fields=["es_correcta"])
            instance.autoevaluacion.recalcular_puntaje()
        return instance


class AutoevaluacionSerializer(serializers.ModelSerializer):
    preguntas = PreguntaAutoevaluacionCreateSerializer(many=True, write_only=True)
    preguntas_detalle = PreguntaAutoevaluacionSerializer(source="preguntas", many=True, read_only=True)

    class Meta:
        model = Autoevaluacion
        fields = [
            "id",
            "alumno",
            "materia",
            "fecha",
            "puntaje",
            "total_preguntas",
            "preguntas",
            "preguntas_detalle",
        ]
        read_only_fields = ["alumno", "fecha", "puntaje", "total_preguntas"]

    def create(self, validated_data):
        preguntas_data = validated_data.pop("preguntas")
        autoevaluacion = Autoevaluacion.objects.create(
            total_preguntas=len(preguntas_data), **validated_data
        )
        PreguntaAutoevaluacion.objects.bulk_create(
            PreguntaAutoevaluacion(autoevaluacion=autoevaluacion, **pregunta)
            for pregunta in preguntas_data
        )
        return autoevaluacion


class RecordatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recordatorio
        fields = [
            "id",
            "tipo",
            "entrega",
            "habito",
            "item_repaso",
            "fecha_hora_envio",
            "canal",
            "estado",
        ]
