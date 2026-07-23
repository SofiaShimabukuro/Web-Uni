import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import type { Materia } from "../../api/cursos";
import {
  actualizarEstadoBloqueEstudio,
  crearBloqueEstudio,
  obtenerBloquesEstudio,
  type BloqueEstudio,
  type TipoBloqueEstudio,
} from "../../api/productividad";
import { hoyISO } from "../../utils/date";

const TIPOS: { value: TipoBloqueEstudio; label: string }[] = [
  { value: "estudio", label: "Estudio" },
  { value: "repaso", label: "Repaso" },
  { value: "entrega", label: "Entrega" },
  { value: "examen", label: "Examen" },
];

const colorPorEstado: Record<BloqueEstudio["estado"], "default" | "success" | "warning"> = {
  planificado: "default",
  cumplido: "success",
  salteado: "warning",
};

interface Props {
  materias: Materia[];
}

export function BloquesEstudioTab({ materias }: Props) {
  const [bloques, setBloques] = useState<BloqueEstudio[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState<string>("");
  const [tipo, setTipo] = useState<TipoBloqueEstudio>("estudio");
  const [fecha, setFecha] = useState(hoyISO());
  const [horaInicio, setHoraInicio] = useState("18:00");
  const [horaFin, setHoraFin] = useState("19:00");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cargarBloques() {
    obtenerBloquesEstudio()
      .then(setBloques)
      .catch(() => setError("No se pudieron cargar tus bloques de estudio."));
  }

  useEffect(cargarBloques, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setEnviando(true);
    try {
      await crearBloqueEstudio({
        materia: materiaId ? Number(materiaId) : null,
        tipo,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: "planificado",
      });
      cargarBloques();
    } catch {
      setFormError("No se pudo crear el bloque. Revisá que la hora de fin sea posterior a la de inicio.");
    } finally {
      setEnviando(false);
    }
  }

  async function marcar(bloque: BloqueEstudio, estado: "cumplido" | "salteado") {
    const actualizado = await actualizarEstadoBloqueEstudio(bloque.id, estado);
    setBloques((prev) => prev?.map((b) => (b.id === bloque.id ? actualizado : b)) ?? null);
  }

  function nombreMateria(id: number | null) {
    if (!id) return "General";
    return materias.find((m) => m.id === id)?.nombre ?? `Materia #${id}`;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nuevo bloque de estudio
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
        >
          {formError && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {formError}
            </Alert>
          )}
          <TextField select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoBloqueEstudio)} sx={{ minWidth: 140 }}>
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
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">General</MenuItem>
            {materias.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
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
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {!bloques ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : bloques.length === 0 ? (
        <Typography color="text.secondary">Todavía no planificaste ningún bloque.</Typography>
      ) : (
        <List>
          {bloques.map((bloque) => (
            <ListItem
              key={bloque.id}
              divider
              secondaryAction={
                bloque.estado === "planificado" && (
                  <>
                    <IconButton
                      edge="end"
                      color="success"
                      title="Marcar cumplido"
                      onClick={() => marcar(bloque, "cumplido")}
                    >
                      <CheckCircleOutlineIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="warning"
                      title="Marcar salteado"
                      onClick={() => marcar(bloque, "salteado")}
                    >
                      <CancelOutlinedIcon />
                    </IconButton>
                  </>
                )
              }
            >
              <ListItemText
                primary={`${bloque.fecha} · ${bloque.hora_inicio.slice(0, 5)}–${bloque.hora_fin.slice(0, 5)} · ${nombreMateria(bloque.materia)}`}
                secondary={
                  <Chip
                    component="span"
                    size="small"
                    label={`${bloque.tipo} · ${bloque.estado}`}
                    color={colorPorEstado[bloque.estado]}
                    sx={{ mt: 0.5 }}
                  />
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
