from rest_framework.permissions import SAFE_METHODS, BasePermission


class EsAdministrativoOSoloLectura(BasePermission):
    """Alta de carrera/materia/comisión: solo administrativo. Lectura: cualquier autenticado."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.rol == "administrativo")


class EsDocenteDeComisionOSoloLectura(BasePermission):
    """Módulo/Recurso/Entrega: solo los edita el docente titular de la comisión (o administrativo)."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        comision = obj.comision if hasattr(obj, "comision") else obj.modulo.comision
        return comision.docente_id == request.user.id or request.user.rol == "administrativo"
