import { useEffect, useState, type FormEvent } from "react";
import { Alert, Box, Button, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { crearCarrera, obtenerCarreras, type Carrera } from "../../api/cursos";

export function CarrerasTab() {
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    obtenerCarreras()
      .then(setCarreras)
      .catch(() => setError("No se pudieron cargar las carreras."));
  }

  useEffect(cargar, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await crearCarrera(nombre);
      setNombre("");
      cargar();
    } finally {
      setEnviando(false);
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nueva carrera
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={{ flexGrow: 1, maxWidth: 420 }}
          />
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {!carreras ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : (
        <List>
          {carreras.map((c) => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.nombre} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
