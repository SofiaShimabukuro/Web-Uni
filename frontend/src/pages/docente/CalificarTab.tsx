import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  calificarEntregaAlumno,
  obtenerEntregasAlumnoDeEntrega,
  obtenerEntregasDeModulo,
  obtenerModulosDeComision,
  type Entrega,
  type EntregaAlumno,
} from "../../api/cursos";

interface Props {
  comisionId: number;
}

export function CalificarTab({ comisionId }: Props) {
  const [entregas, setEntregas] = useState<Entrega[] | null>(null);
  const [entregaId, setEntregaId] = useState<string>("");
  const [envios, setEnvios] = useState<EntregaAlumno[] | null>(null);
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerModulosDeComision(comisionId)
      .then(async (modulos) => {
        const listas = await Promise.all(modulos.map((m) => obtenerEntregasDeModulo(m.id)));
        const todas = listas.flat();
        setEntregas(todas);
        if (todas.length > 0) setEntregaId(String(todas[0].id));
      })
      .catch(() => setError("No se pudieron cargar las entregas."));
  }, [comisionId]);

  useEffect(() => {
    if (!entregaId) return;
    obtenerEntregasAlumnoDeEntrega(Number(entregaId)).then(setEnvios);
  }, [entregaId]);

  async function calificar(envio: EntregaAlumno) {
    const notaTexto = notas[envio.id];
    if (!notaTexto) return;
    const actualizado = await calificarEntregaAlumno(envio.id, Number(notaTexto));
    setEnvios((prev) => prev?.map((e) => (e.id === envio.id ? actualizado : e)) ?? null);
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!entregas) return <Typography color="text.secondary">Cargando...</Typography>;
  if (entregas.length === 0) {
    return <Typography color="text.secondary">Todavía no hay entregas creadas en esta comisión.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        select
        label="Entrega"
        value={entregaId}
        onChange={(e) => setEntregaId(e.target.value)}
        sx={{ maxWidth: 320 }}
      >
        {entregas.map((e) => (
          <MenuItem key={e.id} value={e.id}>
            {e.titulo} ({e.fecha_limite})
          </MenuItem>
        ))}
      </TextField>

      {!envios ? (
        <Typography color="text.secondary">Cargando entregas de alumnos...</Typography>
      ) : envios.length === 0 ? (
        <Typography color="text.secondary">Todavía nadie entregó esto.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {envios.map((envio) => (
            <Box
              key={envio.id}
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography sx={{ flexGrow: 1 }}>
                {envio.alumno_detalle.first_name
                  ? `${envio.alumno_detalle.first_name} ${envio.alumno_detalle.last_name}`
                  : envio.alumno_detalle.username}
              </Typography>
              <Chip label={envio.estado} size="small" />
              {envio.estado === "corregido" ? (
                <Typography variant="body2">Nota: {envio.nota}</Typography>
              ) : (
                <>
                  <TextField
                    size="small"
                    label="Nota"
                    type="number"
                    value={notas[envio.id] ?? ""}
                    onChange={(e) => setNotas((prev) => ({ ...prev, [envio.id]: e.target.value }))}
                    sx={{ maxWidth: 100 }}
                  />
                  <Button size="small" variant="contained" onClick={() => calificar(envio)}>
                    Calificar
                  </Button>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
