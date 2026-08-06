import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import type { Materia } from "../../api/cursos";
import {
  actualizarEvento,
  crearEvento,
  type EventoCalendario,
  type NuevoEvento,
  type RepeticionEvento,
  type TipoEvento,
} from "../../api/agenda";

const TIPOS: { value: TipoEvento; label: string }[] = [
  { value: "clase", label: "Clase" },
  { value: "parcial", label: "Parcial" },
  { value: "final", label: "Final" },
  { value: "entrega", label: "Entrega" },
  { value: "personal", label: "Personal" },
];

interface Props {
  abierto: boolean;
  /** Evento a editar; null para crear uno nuevo. */
  evento: EventoCalendario | null;
  fechaInicial: string;
  materias: Materia[];
  onCerrar: () => void;
  onGuardado: () => void;
}

export function DialogoEvento({
  abierto,
  evento,
  fechaInicial,
  materias,
  onCerrar,
  onGuardado,
}: Props) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("clase");
  const [materiaId, setMateriaId] = useState("");
  const [fecha, setFecha] = useState(fechaInicial);
  const [todoElDia, setTodoElDia] = useState(false);
  const [horaInicio, setHoraInicio] = useState("18:00");
  const [horaFin, setHoraFin] = useState("20:00");
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [repeticion, setRepeticion] = useState<RepeticionEvento>("ninguna");
  const [repetirHasta, setRepetirHasta] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setError(null);
    if (evento) {
      setTitulo(evento.titulo);
      setTipo(evento.tipo);
      setMateriaId(evento.materia ? String(evento.materia) : "");
      setFecha(evento.fecha);
      setTodoElDia(evento.todo_el_dia);
      setHoraInicio(evento.hora_inicio?.slice(0, 5) ?? "18:00");
      setHoraFin(evento.hora_fin?.slice(0, 5) ?? "20:00");
      setLugar(evento.lugar);
      setDescripcion(evento.descripcion);
      setRepeticion(evento.repeticion);
      setRepetirHasta(evento.repetir_hasta ?? "");
    } else {
      setTitulo("");
      setTipo("clase");
      setMateriaId("");
      setFecha(fechaInicial);
      setTodoElDia(false);
      setHoraInicio("18:00");
      setHoraFin("20:00");
      setLugar("");
      setDescripcion("");
      setRepeticion("ninguna");
      setRepetirHasta("");
    }
  }, [abierto, evento, fechaInicial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    const datos: NuevoEvento = {
      titulo,
      descripcion,
      tipo,
      materia: materiaId ? Number(materiaId) : null,
      fecha,
      todo_el_dia: todoElDia,
      hora_inicio: todoElDia ? null : horaInicio,
      hora_fin: todoElDia ? null : horaFin,
      lugar,
      repeticion,
      repetir_hasta: repeticion === "semanal" ? repetirHasta || null : null,
    };
    try {
      if (evento) await actualizarEvento(evento.id, datos);
      else await crearEvento(datos);
      onGuardado();
      onCerrar();
    } catch {
      setError(
        "No se pudo guardar el evento. Revisá que la hora de fin sea posterior a la de inicio y, " +
          "si se repite, que tenga fecha de fin.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{evento ? "Editar evento" : "Nuevo evento"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              autoFocus
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoEvento)}
                sx={{ minWidth: 140 }}
              >
                {TIPOS.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Materia (opcional)"
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Sin materia</MenuItem>
                {materias.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.codigo} — {m.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={todoElDia}
                    onChange={(e) => setTodoElDia(e.target.checked)}
                  />
                }
                label="Todo el día"
              />
              {!todoElDia && (
                <>
                  <TextField
                    label="Desde"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="Hasta"
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label="Repetición"
                value={repeticion}
                onChange={(e) => setRepeticion(e.target.value as RepeticionEvento)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="ninguna">No se repite</MenuItem>
                <MenuItem value="semanal">Todas las semanas</MenuItem>
              </TextField>
              {repeticion === "semanal" && (
                <TextField
                  label="Se repite hasta"
                  type="date"
                  value={repetirHasta}
                  onChange={(e) => setRepetirHasta(e.target.value)}
                  required
                  helperText="Fin de la cursada"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            </Box>
            <TextField
              label="Lugar (opcional)"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              fullWidth
            />
            <TextField
              label="Notas (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
