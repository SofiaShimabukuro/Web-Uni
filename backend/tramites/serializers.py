from rest_framework import serializers

from cursos.models import InscripcionComision

from .models import InscripcionMesa, MesaExamen, SolicitudTramite


class MesaExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = MesaExamen
        fields = ["id", "materia", "docente", "fecha", "tipo"]

    def validate_docente(self, docente):
        if docente.rol != "docente":
            raise serializers.ValidationError("El usuario asignado no tiene rol docente.")
        return docente


class InscripcionMesaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscripcionMesa
        fields = ["id", "alumno", "mesa", "fecha_inscripcion", "estado", "nota"]
        read_only_fields = ["alumno", "fecha_inscripcion"]

    def validate(self, attrs):
        mesa = attrs.get("mesa", getattr(self.instance, "mesa", None))
        if self.instance is None and mesa is not None:
            alumno = self.context["request"].user
            curso_la_materia = InscripcionComision.objects.filter(
                alumno=alumno, comision__materia=mesa.materia
            ).exists()
            if not curso_la_materia:
                raise serializers.ValidationError(
                    "Solo podés inscribirte a mesas de materias que cursaste."
                )
        return attrs

    def _es_presidente_o_administrativo(self, mesa):
        request = self.context["request"]
        if request.user.rol == "administrativo":
            return True
        return mesa is not None and mesa.docente_id == request.user.id

    def validate_nota(self, value):
        if value is None:
            return value
        mesa = self.instance.mesa if self.instance else None
        if not self._es_presidente_o_administrativo(mesa):
            raise serializers.ValidationError(
                "Solo el docente que preside la mesa (o un administrativo) puede cargar la nota."
            )
        return value

    def validate_estado(self, value):
        if value in (InscripcionMesa.Estado.APROBADO, InscripcionMesa.Estado.DESAPROBADO):
            mesa = self.instance.mesa if self.instance else None
            if not self._es_presidente_o_administrativo(mesa):
                raise serializers.ValidationError(
                    "Solo el docente que preside la mesa (o un administrativo) puede cargar el resultado."
                )
        return value


class SolicitudTramiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudTramite
        fields = ["id", "alumno", "tipo", "fecha_solicitud", "estado", "observaciones"]
        read_only_fields = ["alumno", "fecha_solicitud"]

    def validate_estado(self, value):
        if value != SolicitudTramite.Estado.PENDIENTE:
            if self.context["request"].user.rol != "administrativo":
                raise serializers.ValidationError(
                    "Solo un administrativo puede resolver una solicitud de trámite."
                )
        return value
