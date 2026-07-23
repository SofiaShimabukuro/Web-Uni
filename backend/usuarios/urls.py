from django.urls import path

from . import views

urlpatterns = [
    path("csrf/", views.obtener_csrf),
    path("login/", views.iniciar_sesion),
    path("logout/", views.cerrar_sesion),
    path("me/", views.usuario_actual),
]
