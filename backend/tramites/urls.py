from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("mesas-examen", views.MesaExamenViewSet, basename="mesaexamen")
router.register("inscripciones-mesa", views.InscripcionMesaViewSet, basename="inscripcionmesa")
router.register("solicitudes-tramite", views.SolicitudTramiteViewSet, basename="solicitudtramite")

urlpatterns = router.urls
