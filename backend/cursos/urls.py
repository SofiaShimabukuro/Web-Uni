from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("carreras", views.CarreraViewSet)
router.register("materias", views.MateriaViewSet)
router.register("comisiones", views.ComisionViewSet, basename="comision")
router.register("modulos", views.ModuloViewSet, basename="modulo")
router.register("recursos", views.RecursoViewSet, basename="recurso")
router.register("entregas", views.EntregaViewSet, basename="entrega")
router.register("inscripciones", views.InscripcionComisionViewSet, basename="inscripcion")
router.register("entregas-alumnos", views.EntregaAlumnoViewSet, basename="entregaalumno")

urlpatterns = router.urls
