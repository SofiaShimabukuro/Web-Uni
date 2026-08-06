import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import {
  eliminarEvento,
  obtenerAgenda,
  obtenerEventos,
  type EventoCalendario,
  type ItemAgenda,
} from "../api/agenda";
import { obtenerMaterias, type Materia } from "../api/cursos";
import { DetalleDia } from "./calendario/DetalleDia";
import { DialogoEvento } from "./calendario/DialogoEvento";
import { GrillaMes } from "./calendario/GrillaMes";
import { agruparPorFecha, diasDeGrilla, inicioDeGrilla } from "../utils/calendario";
import { fechaISO, nombreMes } from "../utils/date";

export function CalendarioPage() {
  const hoy = useMemo(() => new Date(), []);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaISO(hoy));

  const [items, setItems] = useState<ItemAgenda[] | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [eventoEnEdicion, setEventoEnEdicion] = useState<EventoCalendario | null>(null);

  const cargarAgenda = useCallback(() => {
    const dias = diasDeGrilla(anio, mes);
    const desde = fechaISO(inicioDeGrilla(anio, mes));
    const hasta = fechaISO(dias[dias.length - 1]);
    obtenerAgenda(desde, hasta)
      .then(setItems)
      .catch(() => setError("No se pudo cargar el calendario."));
  }, [anio, mes]);

  useEffect(cargarAgenda, [cargarAgenda]);

  useEffect(() => {
    obtenerMaterias()
      .then(setMaterias)
      .catch(() => setError("No se pudo cargar el listado de materias."));
  }, []);

  function moverMes(delta: number) {
    const nuevo = new Date(anio, mes + delta, 1);
    setAnio(nuevo.getFullYear());
    setMes(nuevo.getMonth());
    setItems(null);
  }

  function irAHoy() {
    setAnio(hoy.getFullYear());
    setMes(hoy.getMonth());
    setFechaSeleccionada(fechaISO(hoy));
  }

  function abrirNuevoEvento() {
    setEventoEnEdicion(null);
    setDialogoAbierto(true);
  }

  async function abrirEdicion(eventoId: number) {
    // La agenda unificada trae solo lo que se dibuja; para editar hace falta el
    // evento completo (repetición, notas, lugar).
    const eventos = await obtenerEventos();
    const evento = eventos.find((e) => e.id === eventoId);
    if (!evento) {
      setError("No se encontró el evento.");
      return;
    }
    setEventoEnEdicion(evento);
    setDialogoAbierto(true);
  }

  async function borrarEvento(eventoId: number) {
    if (!confirm("¿Eliminar este evento del calendario?")) return;
    await eliminarEvento(eventoId);
    cargarAgenda();
  }

  const itemsPorFecha = useMemo(() => agruparPorFecha(items ?? []), [items]);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          Calendario
        </Typography>
        <Button size="small" onClick={irAHoy}>
          Hoy
        </Button>
        <IconButton onClick={() => moverMes(-1)} title="Mes anterior">
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ minWidth: 150, textAlign: "center", textTransform: "capitalize" }}>
          {nombreMes(mes)} {anio}
        </Typography>
        <IconButton onClick={() => moverMes(1)} title="Mes siguiente">
          <ChevronRightIcon />
        </IconButton>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={abrirNuevoEvento}>
          Nuevo evento
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Además de tus eventos, el calendario muestra los bloques del planificador, las fechas
        límite de las entregas de tus comisiones y las mesas de examen en las que te inscribiste.
      </Typography>

      {!items ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <GrillaMes
            anio={anio}
            mes={mes}
            itemsPorFecha={itemsPorFecha}
            fechaSeleccionada={fechaSeleccionada}
            onSeleccionarDia={setFechaSeleccionada}
          />
          <DetalleDia
            fechaIso={fechaSeleccionada}
            items={itemsPorFecha.get(fechaSeleccionada) ?? []}
            onNuevoEvento={abrirNuevoEvento}
            onEditarEvento={abrirEdicion}
            onEliminarEvento={borrarEvento}
          />
        </Box>
      )}

      <DialogoEvento
        abierto={dialogoAbierto}
        evento={eventoEnEdicion}
        fechaInicial={fechaSeleccionada}
        materias={materias}
        onCerrar={() => setDialogoAbierto(false)}
        onGuardado={cargarAgenda}
      />
    </>
  );
}
