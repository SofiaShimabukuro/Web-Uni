from rest_framework import serializers

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


class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ["id", "nombre"]


class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = ["id", "carrera", "codigo", "nombre", "creditos"]


class ComisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comision
        fields = ["id", "materia", "docente", "periodo", "cupo", "aula"]

    def validate_docente(self, docente):
        if docente.rol != "docente":
            raise serializers.ValidationError("El usuario asignado no tiene rol docente.")
        return docente


class ModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        fields = ["id", "comision", "titulo", "orden"]

    def validate_comision(self, comision):
        user = self.context["request"].user
        if user.rol == "administrativo" or comision.docente_id == user.id:
            return comision
        raise serializers.ValidationError(
            "Solo el docente titular de la comisión (o un administrativo) puede crear módulos acá."
        )


class RecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = ["id", "modulo", "tipo", "titulo", "url_o_contenido", "orden"]

    def validate_modulo(self, modulo):
        user = self.context["request"].user
        if user.rol == "administrativo" or modulo.comision.docente_id == user.id:
            return modulo
        raise serializers.ValidationError(
            "Solo el docente titular de la comisión (o un administrativo) puede crear recursos acá."
        )


class EntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = ["id", "modulo", "titulo", "descripcion", "fecha_limite", "puntaje_maximo"]

    def validate_modulo(self, modulo):
        user = self.context["request"].user
        if user.rol == "administrativo" or modulo.comision.docente_id == user.id:
            return modulo
        raise serializers.ValidationError(
            "Solo el docente titular de la comisión (o un administrativo) puede crear entregas acá."
        )


class InscripcionComisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscripcionComision
        fields = ["id", "alumno", "comision", "fecha_inscripcion", "estado"]
        read_only_fields = ["alumno", "fecha_inscripcion"]

    def validate(self, attrs):
        comision = attrs.get("comision", getattr(self.instance, "comision", None))
        if self.instance is None and comision is not None:
            inscriptos_activos = InscripcionComision.objects.filter(
                comision=comision, estado=InscripcionComision.Estado.ACTIVA
            ).count()
            if inscriptos_activos >= comision.cupo:
                raise serializers.ValidationError("La comisión no tiene cupo disponible.")
        return attrs


class EntregaAlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntregaAlumno
        fields = ["id", "entrega", "alumno", "fecha_envio", "archivo_url", "nota", "estado"]
        read_only_fields = ["alumno"]

    def validate(self, attrs):
        entrega = attrs.get("entrega", getattr(self.instance, "entrega", None))
        if self.instance is None and entrega is not None:
            alumno = self.context["request"].user
            inscripto_activo = InscripcionComision.objects.filter(
                alumno=alumno,
                comision=entrega.modulo.comision,
                estado=InscripcionComision.Estado.ACTIVA,
            ).exists()
            if not inscripto_activo:
                raise serializers.ValidationError(
                    "Solo podés entregar en comisiones donde tenés una inscripción activa."
                )
        return attrs

    def validate_nota(self, value):
        if value is None:
            return value
        if self.context["request"].user.rol != "docente":
            raise serializers.ValidationError("Solo un docente puede cargar la nota.")
        return value

    def validate_estado(self, value):
        if value == EntregaAlumno.Estado.CORREGIDO and self.context["request"].user.rol != "docente":
            raise serializers.ValidationError("Solo un docente puede marcar una entrega como corregida.")
        return value
