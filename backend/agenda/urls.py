from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("eventos", views.EventoCalendarioViewSet, basename="evento")
router.register("apuntes", views.ApunteViewSet, basename="apunte")

urlpatterns = [
    path("agenda/", views.AgendaView.as_view(), name="agenda"),
    *router.urls,
]
