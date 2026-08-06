from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from cursos.models import Carrera, Comision, InscripcionComision, Materia

from .models import Apunte, EventoCalendario

Usuario = get_user_model()


def crear_usuario(username, rol="alumno"):
    return Usuario.objects.create_user(username=username, password="secreta123", rol=rol)


class OcurrenciasEventoTests(TestCase):
    """La expansión de los eventos semanales (una fila, N ocurrencias)."""

    def setUp(self):
        self.alumno = crear_usuario("ana")

    def crear_evento(self, **kwargs):
        datos = {
            "alumno": self.alumno,
            "titulo": "Análisis I",
            "fecha": date(2026, 8, 3),
            "todo_el_dia": True,
        }
        return EventoCalendario.objects.create(**{**datos, **kwargs})

    def test_evento_sin_repeticion_solo_cae_en_su_fecha(self):
        evento = self.crear_evento()
        self.assertEqual(evento.ocurrencias(date(2026, 8, 1), date(2026, 8, 31)), [date(2026, 8, 3)])
        self.assertEqual(evento.ocurrencias(date(2026, 9, 1), date(2026, 9, 30)), [])

    def test_evento_semanal_se_expande_cada_siete_dias(self):
        evento = self.crear_evento(
            repeticion=EventoCalendario.Repeticion.SEMANAL, repetir_hasta=date(2026, 8, 31)
        )
        self.assertEqual(
            evento.ocurrencias(date(2026, 8, 1), date(2026, 8, 31)),
            [date(2026, 8, 3), date(2026, 8, 10), date(2026, 8, 17), date(2026, 8, 24), date(2026, 8, 31)],
        )

    def test_evento_semanal_respeta_el_paso_cuando_el_rango_arranca_despues(self):
        evento = self.crear_evento(
            repeticion=EventoCalendario.Repeticion.SEMANAL, repetir_hasta=date(2026, 12, 31)
        )
        # El rango empieza un miércoles: la primera ocurrencia es el lunes siguiente.
        self.assertEqual(
            evento.ocurrencias(date(2026, 8, 12), date(2026, 8, 25)),
            [date(2026, 8, 17), date(2026, 8, 24)],
        )

    def test_evento_semanal_no_pasa_de_repetir_hasta(self):
        evento = self.crear_evento(
            repeticion=EventoCalendario.Repeticion.SEMANAL, repetir_hasta=date(2026, 8, 17)
        )
        self.assertEqual(
            evento.ocurrencias(date(2026, 8, 1), date(2026, 12, 31)),
            [date(2026, 8, 3), date(2026, 8, 10), date(2026, 8, 17)],
        )


class EventoCalendarioAPITests(TestCase):
    def setUp(self):
        self.alumno = crear_usuario("ana")
        self.client = APIClient()
        self.client.force_authenticate(self.alumno)

    def test_crear_evento_con_horario(self):
        respuesta = self.client.post(
            "/api/eventos/",
            {
                "titulo": "Clase de Álgebra",
                "tipo": "clase",
                "fecha": "2026-08-10",
                "todo_el_dia": False,
                "hora_inicio": "18:00",
                "hora_fin": "20:00",
                "repeticion": "semanal",
                "repetir_hasta": "2026-11-30",
            },
        )
        self.assertEqual(respuesta.status_code, 201, respuesta.data)
        self.assertEqual(EventoCalendario.objects.get().alumno, self.alumno)

    def test_rechaza_hora_fin_anterior_al_inicio(self):
        respuesta = self.client.post(
            "/api/eventos/",
            {
                "titulo": "Clase",
                "fecha": "2026-08-10",
                "hora_inicio": "20:00",
                "hora_fin": "18:00",
            },
        )
        self.assertEqual(respuesta.status_code, 400)

    def test_rechaza_evento_semanal_sin_fecha_de_fin(self):
        respuesta = self.client.post(
            "/api/eventos/",
            {"titulo": "Clase", "fecha": "2026-08-10", "todo_el_dia": True, "repeticion": "semanal"},
        )
        self.assertEqual(respuesta.status_code, 400)

    def test_no_se_ven_los_eventos_de_otro_alumno(self):
        EventoCalendario.objects.create(
            alumno=crear_usuario("bruno"), titulo="Ajeno", fecha=date(2026, 8, 10), todo_el_dia=True
        )
        respuesta = self.client.get("/api/eventos/")
        self.assertEqual(respuesta.data["count"], 0)


class AgendaViewTests(TestCase):
    def setUp(self):
        self.alumno = crear_usuario("ana")
        self.client = APIClient()
        self.client.force_authenticate(self.alumno)

    def test_incluye_una_entrada_por_ocurrencia(self):
        EventoCalendario.objects.create(
            alumno=self.alumno,
            titulo="Clase de Álgebra",
            fecha=date(2026, 8, 3),
            todo_el_dia=True,
            repeticion=EventoCalendario.Repeticion.SEMANAL,
            repetir_hasta=date(2026, 8, 24),
        )
        respuesta = self.client.get("/api/agenda/", {"desde": "2026-08-01", "hasta": "2026-08-31"})
        self.assertEqual(respuesta.status_code, 200)
        fechas = [item["fecha"] for item in respuesta.data]
        self.assertEqual(fechas, ["2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24"])
        self.assertTrue(all(item["origen"] == "evento" for item in respuesta.data))

    def test_rechaza_rango_invalido(self):
        respuesta = self.client.get("/api/agenda/", {"desde": "2026-08-31", "hasta": "2026-08-01"})
        self.assertEqual(respuesta.status_code, 400)

    def test_rechaza_fecha_mal_formada(self):
        respuesta = self.client.get("/api/agenda/", {"desde": "31/08/2026"})
        self.assertEqual(respuesta.status_code, 400)


@override_settings(MEDIA_ROOT="/tmp/web-uni-test-media")
class ApunteAPITests(TestCase):
    def setUp(self):
        self.alumno = crear_usuario("ana")
        self.companiero = crear_usuario("bruno")
        self.ajeno = crear_usuario("carla")
        carrera = Carrera.objects.create(nombre="Ingeniería")
        self.materia = Materia.objects.create(carrera=carrera, codigo="MAT1", nombre="Análisis I")
        docente = crear_usuario("dora", rol="docente")
        comision = Comision.objects.create(
            materia=self.materia, docente=docente, periodo="2026-2S", cupo=30
        )
        for alumno in (self.alumno, self.companiero):
            InscripcionComision.objects.create(alumno=alumno, comision=comision)
        self.client = APIClient()
        self.client.force_authenticate(self.alumno)

    def archivo(self, nombre="apunte.pdf"):
        return SimpleUploadedFile(nombre, b"contenido del apunte", content_type="application/pdf")

    def test_subir_apunte_guarda_nombre_y_tamano(self):
        respuesta = self.client.post(
            "/api/apuntes/",
            {"titulo": "Clase 1", "tipo": "apunte", "archivo": self.archivo()},
            format="multipart",
        )
        self.assertEqual(respuesta.status_code, 201, respuesta.data)
        apunte = Apunte.objects.get()
        self.assertEqual(apunte.alumno, self.alumno)
        self.assertEqual(apunte.nombre_archivo, "apunte.pdf")
        self.assertEqual(apunte.tamano_bytes, len(b"contenido del apunte"))
        self.assertIn(f"/api/apuntes/{apunte.id}/archivo/", respuesta.data["archivo_url"])

    def test_apunte_sin_archivo_ni_enlace_es_rechazado(self):
        respuesta = self.client.post("/api/apuntes/", {"titulo": "Vacío", "tipo": "apunte"})
        self.assertEqual(respuesta.status_code, 400)

    def test_apunte_solo_con_enlace_es_valido(self):
        respuesta = self.client.post(
            "/api/apuntes/",
            {"titulo": "Grabación", "tipo": "enlace", "enlace": "https://drive.example/abc"},
        )
        self.assertEqual(respuesta.status_code, 201, respuesta.data)
        self.assertIsNone(respuesta.data["archivo_url"])

    def test_compartir_sin_materia_es_rechazado(self):
        respuesta = self.client.post(
            "/api/apuntes/",
            {
                "titulo": "Clase 1",
                "tipo": "apunte",
                "visibilidad": "comision",
                "archivo": self.archivo(),
            },
            format="multipart",
        )
        self.assertEqual(respuesta.status_code, 400)

    def test_extension_no_permitida_es_rechazada(self):
        respuesta = self.client.post(
            "/api/apuntes/",
            {
                "titulo": "Ejecutable",
                "tipo": "apunte",
                "archivo": SimpleUploadedFile("virus.exe", b"MZ", content_type="application/exe"),
            },
            format="multipart",
        )
        self.assertEqual(respuesta.status_code, 400)

    @override_settings(APUNTES_TAMANO_MAXIMO_MB=0)
    def test_archivo_demasiado_grande_es_rechazado(self):
        respuesta = self.client.post(
            "/api/apuntes/",
            {"titulo": "Grabación", "tipo": "grabacion", "archivo": self.archivo("clase.mp3")},
            format="multipart",
        )
        self.assertEqual(respuesta.status_code, 400)

    def test_apunte_privado_no_lo_ve_nadie_mas(self):
        apunte = Apunte.objects.create(
            alumno=self.alumno, titulo="Privado", materia=self.materia, enlace="https://x.example"
        )
        self.client.force_authenticate(self.companiero)
        self.assertEqual(self.client.get("/api/apuntes/").data["count"], 0)
        self.assertEqual(self.client.get(f"/api/apuntes/{apunte.id}/").status_code, 404)

    def test_apunte_compartido_lo_ve_la_comision_pero_no_un_ajeno(self):
        Apunte.objects.create(
            alumno=self.alumno,
            titulo="Compartido",
            materia=self.materia,
            enlace="https://x.example",
            visibilidad=Apunte.Visibilidad.COMISION,
        )
        self.client.force_authenticate(self.companiero)
        respuesta = self.client.get("/api/apuntes/")
        self.assertEqual(respuesta.data["count"], 1)
        self.assertFalse(respuesta.data["results"][0]["es_propio"])

        self.client.force_authenticate(self.ajeno)
        self.assertEqual(self.client.get("/api/apuntes/").data["count"], 0)

    def test_un_companiero_no_puede_editar_ni_borrar_un_apunte_compartido(self):
        apunte = Apunte.objects.create(
            alumno=self.alumno,
            titulo="Compartido",
            materia=self.materia,
            enlace="https://x.example",
            visibilidad=Apunte.Visibilidad.COMISION,
        )
        self.client.force_authenticate(self.companiero)
        self.assertEqual(
            self.client.patch(f"/api/apuntes/{apunte.id}/", {"titulo": "Editado"}).status_code, 403
        )
        self.assertEqual(self.client.delete(f"/api/apuntes/{apunte.id}/").status_code, 403)

    def test_descarga_del_archivo_respeta_los_permisos(self):
        creado = self.client.post(
            "/api/apuntes/",
            {
                "titulo": "Clase 1",
                "tipo": "apunte",
                "materia": self.materia.id,
                "visibilidad": "comision",
                "archivo": self.archivo(),
            },
            format="multipart",
        ).data
        url = f"/api/apuntes/{creado['id']}/archivo/"

        respuesta = self.client.get(url)
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(b"".join(respuesta.streaming_content), b"contenido del apunte")

        self.client.force_authenticate(self.companiero)
        self.assertEqual(self.client.get(url).status_code, 200)

        self.client.force_authenticate(self.ajeno)
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_no_se_puede_colgar_un_apunte_de_un_evento_ajeno(self):
        evento = EventoCalendario.objects.create(
            alumno=self.companiero, titulo="Ajeno", fecha=date.today(), todo_el_dia=True
        )
        respuesta = self.client.post(
            "/api/apuntes/",
            {"titulo": "Clase 1", "enlace": "https://x.example", "evento": evento.id},
        )
        self.assertEqual(respuesta.status_code, 400)

    def test_filtro_por_propios(self):
        Apunte.objects.create(
            alumno=self.alumno, titulo="Mío", materia=self.materia, enlace="https://x.example"
        )
        Apunte.objects.create(
            alumno=self.companiero,
            titulo="De la comisión",
            materia=self.materia,
            enlace="https://y.example",
            visibilidad=Apunte.Visibilidad.COMISION,
        )
        self.assertEqual(self.client.get("/api/apuntes/").data["count"], 2)
        self.assertEqual(self.client.get("/api/apuntes/?propios=true").data["count"], 1)
        self.assertEqual(
            self.client.get("/api/apuntes/?propios=false").data["results"][0]["titulo"],
            "De la comisión",
        )

    def test_borrar_el_apunte_borra_el_archivo(self):
        creado = self.client.post(
            "/api/apuntes/",
            {"titulo": "Clase 1", "tipo": "apunte", "archivo": self.archivo()},
            format="multipart",
        ).data
        ruta = Apunte.objects.get(pk=creado["id"]).archivo.path
        self.assertEqual(self.client.delete(f"/api/apuntes/{creado['id']}/").status_code, 204)
        import os

        self.assertFalse(os.path.exists(ruta))


class ApuntesFechaLimiteTests(TestCase):
    """Un evento borrado no debe arrastrar los apuntes colgados de él."""

    def test_borrar_el_evento_conserva_el_apunte(self):
        alumno = crear_usuario("ana")
        evento = EventoCalendario.objects.create(
            alumno=alumno, titulo="Clase", fecha=date.today() + timedelta(days=1), todo_el_dia=True
        )
        apunte = Apunte.objects.create(
            alumno=alumno, titulo="Apunte de esa clase", evento=evento, enlace="https://x.example"
        )
        evento.delete()
        apunte.refresh_from_db()
        self.assertIsNone(apunte.evento)
