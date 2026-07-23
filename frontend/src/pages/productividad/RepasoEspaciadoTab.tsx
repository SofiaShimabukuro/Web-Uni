import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { Materia } from "../../api/cursos";
import {
  crearItemRepaso,
  obtenerItemsRepasoPendientes,
  registrarSesionRepaso,
  type Calificacion,
  type ItemRepaso,
} from "../../api/productividad";

const CALIFICACIONES: { value: Calificacion; label: string; color: "error" | "warning" | "primary" | "success" }[] = [
  { value: "otra_vez", label: "Otra vez", color: "error" },
  { value: "dificil", label: "Difícil", color: "warning" },
  { value: "bien", label: "Bien", color: "primary" },
  { value: "facil", label: "Fácil", color: "success" },
];

interface Props {
  materias: Materia[];
}

export function RepasoEspaciadoTab({ materias }: Props) {
  const [pendientes, setPendientes] = useState<ItemRepaso[] | null>(null);
  const [revelados, setRevelados] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState<string>("");
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    obtenerItemsRepasoPendientes()
      .then(setPendientes)
      .catch(() => setError("No se pudo cargar la cola de repaso."));
  }

  useEffect(cargar, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await crearItemRepaso({
        materia: materiaId ? Number(materiaId) : null,
        pregunta,
        respuesta,
      });
      setPregunta("");
      setRespuesta("");
      cargar();
    } finally {
      setEnviando(false);
    }
  }

  async function calificar(item: ItemRepaso, calificacion: Calificacion) {
    await registrarSesionRepaso(item.id, calificacion);
    setPendientes((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
  }

  function nombreMateria(id: number | null) {
    if (!id) return null;
    return materias.find((m) => m.id === id)?.nombre;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nueva tarjeta de repaso
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start" }}
        >
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
            label="Pregunta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            required
            sx={{ minWidth: 240, flexGrow: 1 }}
          />
          <TextField
            label="Respuesta"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            required
            sx={{ minWidth: 240, flexGrow: 1 }}
          />
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      <Typography variant="subtitle1">Para repasar hoy</Typography>
      {!pendientes ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : pendientes.length === 0 ? (
        <Typography color="text.secondary">No tenés repasos pendientes. ¡Al día!</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {pendientes.map((item) => {
            const revelado = revelados.has(item.id);
            const materiaNombre = nombreMateria(item.materia);
            return (
              <Card key={item.id} variant="outlined">
                <CardContent>
                  {materiaNombre && (
                    <Typography variant="overline" color="text.secondary">
                      {materiaNombre}
                    </Typography>
                  )}
                  <Typography variant="body1" gutterBottom>
                    {item.pregunta}
                  </Typography>
                  {revelado ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.respuesta}
                      </Typography>
                      <ButtonGroup>
                        {CALIFICACIONES.map((c) => (
                          <Button key={c.value} color={c.color} onClick={() => calificar(item, c.value)}>
                            {c.label}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => setRevelados((prev) => new Set(prev).add(item.id))}
                    >
                      Mostrar respuesta
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
