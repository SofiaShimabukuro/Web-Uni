import { useEffect, useState } from "react";
import {
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { obtenerLegajo, type EntradaLegajo } from "../../api/tramites";

export function LegajoTab() {
  const [entradas, setEntradas] = useState<EntradaLegajo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerLegajo()
      .then(setEntradas)
      .catch(() => setError("No se pudo cargar el legajo."));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!entradas) return <Typography color="text.secondary">Cargando...</Typography>;
  if (entradas.length === 0) {
    return (
      <Typography color="text.secondary">
        Todavía no tenés materias aprobadas registradas.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Materia</TableCell>
            <TableCell>Vía</TableCell>
            <TableCell>Período / fecha</TableCell>
            <TableCell>Nota</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entradas.map((e, i) => (
            <TableRow key={i}>
              <TableCell>{e.materia_codigo}</TableCell>
              <TableCell>{e.materia_nombre}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={e.origen === "mesa" ? "Final rendido" : "Cursada"}
                  color={e.origen === "mesa" ? "secondary" : "primary"}
                />
              </TableCell>
              <TableCell>{e.periodo}</TableCell>
              <TableCell>{e.nota ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
