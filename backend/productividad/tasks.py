"""Jobs periódicos que generan `recordatorio` automáticamente.

Ver regla de negocio 2 de docs/procesos/02-productividad-desempeno.md:
los recordatorios los genera un job (Celery beat), nunca una acción
manual del alumno. `examen_proximo` no está implementado todavía: no hay
una entidad de "mesa de examen" (Proceso 03, sin modelar aún) de la que
leer la fecha.
"""

from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from cursos.models import Entrega, InscripcionComision

from .models import Habito, ItemRepaso, Recordatorio, RegistroHabito


@shared_task
def generar_recordatorios_entregas_proximas():
    """Un recordatorio por alumno inscripto activo que todavía no entregó,
    para cada `entrega` cuya `fecha_limite` cae dentro de las próximas 24hs."""
    ahora = timezone.now()
    limite = (ahora + timedelta(hours=24)).date()
    entregas_proximas = Entrega.objects.filter(
        fecha_limite__gte=ahora.date(), fecha_limite__lte=limite
    ).select_related("modulo__comision")

    creados = 0
    for entrega in entregas_proximas:
        inscriptos_sin_entregar = InscripcionComision.objects.filter(
            comision=entrega.modulo.comision,
            estado=InscripcionComision.Estado.ACTIVA,
        ).exclude(alumno__entregas_realizadas__entrega=entrega)

        for inscripcion in inscriptos_sin_entregar.select_related("alumno"):
            _, fue_creado = Recordatorio.objects.get_or_create(
                alumno=inscripcion.alumno,
                tipo=Recordatorio.Tipo.ENTREGA_PROXIMA,
                entrega=entrega,
                estado=Recordatorio.Estado.PENDIENTE,
                defaults={"fecha_hora_envio": ahora, "canal": Recordatorio.Canal.PUSH},
            )
            creados += int(fue_creado)
    return creados


@shared_task
def generar_recordatorios_habitos():
    """Recordatorio para hábitos diarios sin `registro_habito` cumplido ayer.

    Frecuencias `semanal`/`dias_especificos` quedan fuera: "no cumplido el
    día anterior" solo tiene sentido tal cual para hábitos diarios.
    """
    ayer = timezone.localdate() - timedelta(days=1)
    ahora = timezone.now()
    creados = 0

    habitos_diarios = Habito.objects.filter(activo=True, frecuencia=Habito.Frecuencia.DIARIA)
    for habito in habitos_diarios:
        cumplido_ayer = RegistroHabito.objects.filter(
            habito=habito, fecha=ayer, cumplido=True
        ).exists()
        if cumplido_ayer:
            continue
        _, fue_creado = Recordatorio.objects.get_or_create(
            alumno=habito.alumno,
            tipo=Recordatorio.Tipo.HABITO,
            habito=habito,
            estado=Recordatorio.Estado.PENDIENTE,
            defaults={"fecha_hora_envio": ahora, "canal": Recordatorio.Canal.PUSH},
        )
        creados += int(fue_creado)
    return creados


@shared_task
def generar_recordatorios_repaso_espaciado():
    """Recordatorio para cada `item_repaso` cuya `proxima_fecha_repaso` ya llegó."""
    hoy = timezone.localdate()
    ahora = timezone.now()
    creados = 0

    for item in ItemRepaso.objects.filter(proxima_fecha_repaso__lte=hoy):
        _, fue_creado = Recordatorio.objects.get_or_create(
            alumno=item.alumno,
            tipo=Recordatorio.Tipo.REPASO_ESPACIADO,
            item_repaso=item,
            estado=Recordatorio.Estado.PENDIENTE,
            defaults={"fecha_hora_envio": ahora, "canal": Recordatorio.Canal.PUSH},
        )
        creados += int(fue_creado)
    return creados


@shared_task
def generar_todos_los_recordatorios():
    return {
        "entregas_proximas": generar_recordatorios_entregas_proximas(),
        "habitos": generar_recordatorios_habitos(),
        "repaso_espaciado": generar_recordatorios_repaso_espaciado(),
    }
