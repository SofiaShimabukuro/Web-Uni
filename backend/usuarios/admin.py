from django.contrib.auth.admin import UserAdmin

from django.contrib import admin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("username", "first_name", "last_name", "email", "rol", "is_staff")
    list_filter = UserAdmin.list_filter + ("rol",)
    fieldsets = UserAdmin.fieldsets + (("Rol académico", {"fields": ("rol",)}),)
