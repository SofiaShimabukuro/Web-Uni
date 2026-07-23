import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { crearMateria, obtenerCarreras, obtenerMaterias, type Carrera, type Materia } from "../../api/cursos";

export function MateriasTab() {
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [carreraId, setCarreraId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [creditos, setCreditos] = useState("4");
  const [semestre, setSemestre] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    Promise.all([obtenerMaterias(), obtenerCarreras()])
      .then(([m, c]) => {
        setMaterias(m);
        setCarreras(c);
        if (!carreraId && c.length > 0) setCarreraId(String(c[0].id));
      })
      .catch(() => setError("No se pudieron cargar las materias."));
  }

  useEffect(cargar, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setEnviando(true);
    try {
      await crearMateria({
        carrera: Number(carreraId),
        codigo,
        nombre,
        creditos: Number(creditos),
        semestre: semestre ? Number(semestre) : null,
      });
      setCodigo("");
      setNombre("");
      cargar();
    } catch {
      setFormError("No se pudo crear la materia. ¿El código ya existe?");
    } finally {
      setEnviando(false);
    }
  }

  function nombreCarrera(id: number) {
    return carreras?.find((c) => c.id === id)?.nombre ?? `Carrera #${id}`;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nueva materia
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
          <TextField
            select
            label="Carrera"
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value)}
            required
            sx={{ minWidth: 220 }}
          >
            {carreras?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} required sx={{ maxWidth: 120 }} />
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            sx={{ minWidth: 220, flexGrow: 1 }}
          />
          <TextField
            label="Créditos"
            type="number"
            value={creditos}
            onChange={(e) => setCreditos(e.target.value)}
            sx={{ maxWidth: 100 }}
          />
          <TextField
            label="Semestre"
            type="number"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            sx={{ maxWidth: 110 }}
          />
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {!materias ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Semestre</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Créditos</TableCell>
                <TableCell>Carrera</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materias.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.semestre ?? "—"}</TableCell>
                  <TableCell>{m.codigo}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell>{m.creditos}</TableCell>
                  <TableCell>{nombreCarrera(m.carrera)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
