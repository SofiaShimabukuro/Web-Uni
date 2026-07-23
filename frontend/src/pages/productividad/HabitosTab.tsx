import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  actualizarRegistroHabito,
  crearHabito,
  marcarRegistroHabito,
  obtenerHabitos,
  obtenerRegistroDeHoy,
  type FrecuenciaHabito,
  type Habito,
  type RegistroHabito,
} from "../../api/productividad";
import { hoyISO } from "../../utils/date";

const FRECUENCIAS: { value: FrecuenciaHabito; label: string }[] = [
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "dias_especificos", label: "Días específicos" },
];

export function HabitosTab() {
  const [habitos, setHabitos] = useState<Habito[] | null>(null);
  const [registros, setRegistros] = useState<Record<number, RegistroHabito | null>>({});
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaHabito>("diaria");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    try {
      const lista = await obtenerHabitos();
      setHabitos(lista);
      const hoy = hoyISO();
      const entries = await Promise.all(
        lista.map(async (h) => [h.id, await obtenerRegistroDeHoy(h.id, hoy)] as const),
      );
      setRegistros(Object.fromEntries(entries));
    } catch {
      setError("No se pudieron cargar tus hábitos.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await crearHabito({ nombre, frecuencia });
      setNombre("");
      await cargar();
    } finally {
      setEnviando(false);
    }
  }

  async function toggle(habito: Habito) {
    const hoy = hoyISO();
    const actual = registros[habito.id];
    if (actual) {
      const actualizado = await actualizarRegistroHabito(actual.id, !actual.cumplido);
      setRegistros((prev) => ({ ...prev, [habito.id]: actualizado }));
    } else {
      const creado = await marcarRegistroHabito(habito.id, hoy, true);
      setRegistros((prev) => ({ ...prev, [habito.id]: creado }));
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nuevo hábito
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
        >
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            label="Frecuencia"
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value as FrecuenciaHabito)}
            sx={{ minWidth: 180 }}
          >
            {FRECUENCIAS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {!habitos ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : habitos.length === 0 ? (
        <Typography color="text.secondary">Todavía no cargaste ningún hábito.</Typography>
      ) : (
        <List>
          {habitos.map((habito) => {
            const registro = registros[habito.id];
            return (
              <ListItem key={habito.id} divider>
                <ListItemText
                  primary={habito.nombre}
                  secondary={<Chip component="span" size="small" label={habito.frecuencia} sx={{ mt: 0.5 }} />}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {registro ? (registro.cumplido ? "Cumplido hoy" : "No cumplido hoy") : "Sin registrar hoy"}
                  </Typography>
                  <Switch checked={Boolean(registro?.cumplido)} onChange={() => toggle(habito)} />
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}
