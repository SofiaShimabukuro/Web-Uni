from rest_framework.permissions import BasePermission


class EsAdministrativo(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.rol == "administrativo")
