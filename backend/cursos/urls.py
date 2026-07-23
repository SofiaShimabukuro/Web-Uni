from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("carreras", views.CarreraViewSet)
router.register("materias", views.MateriaViewSet)
router.register("comisiones", views.ComisionViewSet)
router.register("modulos", views.ModuloViewSet)
router.register("recursos", views.RecursoViewSet)
router.register("entregas", views.EntregaViewSet)
router.register("inscripciones", views.InscripcionComisionViewSet, basename="inscripcion")
router.register("entregas-alumnos", views.EntregaAlumnoViewSet, basename="entregaalumno")

urlpatterns = router.urls
