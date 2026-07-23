from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("bloques-estudio", views.BloqueEstudioViewSet, basename="bloqueestudio")
router.register("habitos", views.HabitoViewSet, basename="habito")
router.register("registros-habito", views.RegistroHabitoViewSet, basename="registrohabito")
router.register("items-repaso", views.ItemRepasoViewSet, basename="itemrepaso")
router.register("sesiones-repaso", views.SesionRepasoViewSet, basename="sesionrepaso")
router.register("autoevaluaciones", views.AutoevaluacionViewSet, basename="autoevaluacion")
router.register(
    "preguntas-autoevaluacion",
    views.PreguntaAutoevaluacionViewSet,
    basename="preguntaautoevaluacion",
)
router.register("recordatorios", views.RecordatorioViewSet, basename="recordatorio")

urlpatterns = router.urls
