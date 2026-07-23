import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import type { Materia } from "../../api/cursos";
import {
  crearAutoevaluacion,
  obtenerAutoevaluaciones,
  responderPregunta,
  type Autoevaluacion,
  type NuevaPregunta,
} from "../../api/productividad";

interface Props {
  materias: Materia[];
}

function filaVacia(): NuevaPregunta {
  return { enunciado: "", respuesta_correcta: "" };
}

export function AutoevaluacionesTab({ materias }: Props) {
  const [autoevaluaciones, setAutoevaluaciones] = useState<Autoevaluacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState<string>("");
  const [preguntas, setPreguntas] = useState<NuevaPregunta[]>([filaVacia()]);
  const [enviando, setEnviando] = useState(false);
  const [respuestasDraft, setRespuestasDraft] = useState<Record<number, string>>({});

  function cargar() {
    obtenerAutoevaluaciones()
      .then(setAutoevaluaciones)
      .catch(() => setError("No se pudieron cargar tus autoevaluaciones."));
  }

  useEffect(cargar, []);

  function actualizarFila(index: number, campo: keyof NuevaPregunta, valor: string) {
    setPreguntas((prev) => prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p)));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!materiaId) return;
    setEnviando(true);
    try {
      await crearAutoevaluacion(
        Number(materiaId),
        preguntas.filter((p) => p.enunciado.trim() && p.respuesta_correcta.trim()),
      );
      setPreguntas([filaVacia()]);
      cargar();
    } finally {
      setEnviando(false);
    }
  }

  async function responder(preguntaId: number) {
    const respuesta = respuestasDraft[preguntaId];
    if (!respuesta?.trim()) return;
    await responderPregunta(preguntaId, respuesta);
    cargar();
  }

  function nombreMateria(id: number) {
    return materias.find((m) => m.id === id)?.nombre ?? `Materia #${id}`;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nueva autoevaluación
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Materia"
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            required
            sx={{ maxWidth: 320 }}
          >
            {materias.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </MenuItem>
            ))}
          </TextField>

          {preguntas.map((p, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label={`Pregunta ${index + 1}`}
                value={p.enunciado}
                onChange={(e) => actualizarFila(index, "enunciado", e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Respuesta correcta"
                value={p.respuesta_correcta}
                onChange={(e) => actualizarFila(index, "respuesta_correcta", e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <IconButton
                aria-label="Quitar pregunta"
                onClick={() => setPreguntas((prev) => prev.filter((_, i) => i !== index))}
                disabled={preguntas.length === 1}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          ))}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setPreguntas((prev) => [...prev, filaVacia()])}
            >
              Agregar pregunta
            </Button>
            <Button type="submit" variant="contained" disabled={enviando}>
              Crear autoevaluación
            </Button>
          </Box>
        </Box>
      </Paper>

      {!autoevaluaciones ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : autoevaluaciones.length === 0 ? (
        <Typography color="text.secondary">Todavía no creaste ninguna autoevaluación.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {autoevaluaciones.map((autoeval) => (
            <Card key={autoeval.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle1">{nombreMateria(autoeval.materia)}</Typography>
                  <Chip
                    label={autoeval.puntaje !== null ? `${Number(autoeval.puntaje).toFixed(0)}%` : "sin corregir"}
                    color={autoeval.puntaje !== null ? "primary" : "default"}
                    size="small"
                  />
                </Box>
                <Divider sx={{ mb: 1 }} />
                {autoeval.preguntas_detalle.map((pregunta) => (
                  <Box key={pregunta.id} sx={{ py: 1 }}>
                    <Typography variant="body2">{pregunta.enunciado}</Typography>
                    {pregunta.es_correcta === null ? (
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <TextField
                          size="small"
                          placeholder="Tu respuesta"
                          value={respuestasDraft[pregunta.id] ?? ""}
                          onChange={(e) =>
                            setRespuestasDraft((prev) => ({ ...prev, [pregunta.id]: e.target.value }))
                          }
                        />
                        <Button size="small" onClick={() => responder(pregunta.id)}>
                          Responder
                        </Button>
                      </Box>
                    ) : (
                      <Chip
                        size="small"
                        label={pregunta.es_correcta ? "Correcta" : `Incorrecta (era: ${pregunta.respuesta_correcta})`}
                        color={pregunta.es_correcta ? "success" : "error"}
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
