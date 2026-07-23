from rest_framework.permissions import BasePermission


class EsPropietario(BasePermission):
    """Todo el módulo de productividad es personal: cada alumno ve/edita solo lo suyo."""

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "alumno_id"):
            return obj.alumno_id == request.user.id
        if hasattr(obj, "habito"):
            return obj.habito.alumno_id == request.user.id
        if hasattr(obj, "item_repaso"):
            return obj.item_repaso.alumno_id == request.user.id
        if hasattr(obj, "autoevaluacion"):
            return obj.autoevaluacion.alumno_id == request.user.id
        return False
