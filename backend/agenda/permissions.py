from rest_framework.permissions import SAFE_METHODS, BasePermission


class EsPropietario(BasePermission):
    """El calendario es personal: cada uno ve y edita solo lo suyo."""

    def has_object_permission(self, request, view, obj):
        return obj.alumno_id == request.user.id


class EsPropietarioOLectura(BasePermission):
    """Los apuntes compartidos se leen; solo el autor puede editarlos o borrarlos.

    La lectura ya viene acotada por el queryset del viewset (propios + los que
    la comisión compartió), así que acá solo hace falta cortar la escritura.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.alumno_id == request.user.id
