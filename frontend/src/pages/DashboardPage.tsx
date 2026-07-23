import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { obtenerMisInscripciones, type Inscripcion } from "../api/cursos";

const colorPorEstado: Record<Inscripcion["estado"], "primary" | "default" | "success" | "error"> = {
  activa: "primary",
  aprobada: "success",
  desaprobada: "error",
  abandonada: "default",
};

export function DashboardPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerMisInscripciones()
      .then(setInscripciones)
      .catch(() => setError("No se pudieron cargar tus comisiones."));
  }, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!inscripciones) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Mis comisiones
      </Typography>
      {inscripciones.length === 0 && (
        <Typography color="text.secondary">
          Todavía no estás inscripto en ninguna comisión.
        </Typography>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2,
        }}
      >
        {inscripciones.map((inscripcion) => (
          <Card key={inscripcion.id} variant="outlined">
            <CardActionArea onClick={() => navigate(`/comisiones/${inscripcion.comision}`)}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {inscripcion.comision_detalle.materia_codigo}
                </Typography>
                <Typography variant="h6">{inscripcion.comision_detalle.materia_nombre}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {inscripcion.comision_detalle.periodo} · {inscripcion.comision_detalle.docente_nombre}
                </Typography>
                <Chip
                  label={inscripcion.estado}
                  color={colorPorEstado[inscripcion.estado]}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </>
  );
}
