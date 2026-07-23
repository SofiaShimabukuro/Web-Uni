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
import { crearComision, obtenerComisiones, obtenerMaterias, type Comision, type Materia } from "../../api/cursos";
import { obtenerDocentes } from "../../api/usuarios";
import type { Usuario } from "../../api/auth";

export function ComisionesTab() {
  const [comisiones, setComisiones] = useState<Comision[] | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [docentes, setDocentes] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [cupo, setCupo] = useState("30");
  const [aula, setAula] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    Promise.all([obtenerComisiones(), obtenerMaterias(), obtenerDocentes()])
      .then(([c, m, d]) => {
        setComisiones(c);
        setMaterias(m);
        setDocentes(d);
        if (!materiaId && m.length > 0) setMateriaId(String(m[0].id));
        if (!docenteId && d.length > 0) setDocenteId(String(d[0].id));
      })
      .catch(() => setError("No se pudieron cargar las comisiones."));
  }

  useEffect(cargar, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setEnviando(true);
    try {
      await crearComision({
        materia: Number(materiaId),
        docente: Number(docenteId),
        periodo,
        cupo: Number(cupo),
        aula,
      });
      setPeriodo("");
      setAula("");
      cargar();
    } catch {
      setFormError("No se pudo crear la comisión.");
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
          Nueva comisión
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
            label="Docente"
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
            label="Período"
            placeholder="2026-2S"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            required
            sx={{ maxWidth: 140 }}
          />
          <TextField
            label="Cupo"
            type="number"
            value={cupo}
            onChange={(e) => setCupo(e.target.value)}
            sx={{ maxWidth: 100 }}
          />
          <TextField label="Aula" value={aula} onChange={(e) => setAula(e.target.value)} sx={{ maxWidth: 140 }} />
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {!comisiones ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Materia</TableCell>
                <TableCell>Docente</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Cupo</TableCell>
                <TableCell>Aula</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comisiones.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{nombreMateria(c.materia)}</TableCell>
                  <TableCell>{nombreDocente(c.docente)}</TableCell>
                  <TableCell>{c.periodo}</TableCell>
                  <TableCell>{c.cupo}</TableCell>
                  <TableCell>{c.aula}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
