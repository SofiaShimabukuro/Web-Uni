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
import { obtenerMaterias, type Materia } from "../../api/cursos";
import { obtenerDocentes } from "../../api/usuarios";
import type { Usuario } from "../../api/auth";
import { crearMesaExamen, obtenerMesasExamen, type MesaExamen, type TipoMesa } from "../../api/tramites";

export function MesasExamenAdminTab() {
  const [mesas, setMesas] = useState<MesaExamen[] | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [docentes, setDocentes] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState<TipoMesa>("final");
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    Promise.all([obtenerMesasExamen(), obtenerMaterias(), obtenerDocentes()])
      .then(([m, mat, doc]) => {
        setMesas(m);
        setMaterias(mat);
        setDocentes(doc);
        if (!materiaId && mat.length > 0) setMateriaId(String(mat[0].id));
        if (!docenteId && doc.length > 0) setDocenteId(String(doc[0].id));
      })
      .catch(() => setError("No se pudieron cargar las mesas de examen."));
  }

  useEffect(cargar, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await crearMesaExamen({ materia: Number(materiaId), docente: Number(docenteId), fecha, tipo });
      setFecha("");
      cargar();
    } finally {
      setEnviando(false);
    }
  }

  function nombreMateria(id: number) {
    const m = materias?.find((x) => x.id === id);
    return m ? `${m.codigo} — ${m.nombre}` : `Materia #${id}`;
  }

  function nombreDocente(id: number) {
    const d = docentes?.find((x) => x.id === id);
    return d ? d.first_name || d.username : `Docente #${id}`;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Convocar mesa
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
        >
          <TextField
            select
            label="Materia"
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            required
            sx={{ minWidth: 240 }}
          >
            {materias?.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Docente (presidente)"
            value={docenteId}
            onChange={(e) => setDocenteId(e.target.value)}
            required
            sx={{ minWidth: 180 }}
          >
            {docentes?.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.first_name ? `${d.first_name} ${d.last_name}` : d.username}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoMesa)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="final">Final</MenuItem>
            <MenuItem value="recuperatorio">Recuperatorio</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" disabled={enviando}>
            Convocar
          </Button>
        </Box>
      </Paper>

      {!mesas ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Materia</TableCell>
                <TableCell>Docente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mesas.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{nombreMateria(m.materia)}</TableCell>
                  <TableCell>{nombreDocente(m.docente)}</TableCell>
                  <TableCell>{m.fecha}</TableCell>
                  <TableCell>{m.tipo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
