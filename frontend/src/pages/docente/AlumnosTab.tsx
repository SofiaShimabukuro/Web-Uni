import { useEffect, useState } from "react";
import { Alert, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { obtenerInscriptosDeComision, type Inscripcion } from "../../api/cursos";

const colorPorEstado: Record<Inscripcion["estado"], "primary" | "default" | "success" | "error"> = {
  activa: "primary",
  aprobada: "success",
  desaprobada: "error",
  abandonada: "default",
};

interface Props {
  comisionId: number;
}

export function AlumnosTab({ comisionId }: Props) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerInscriptosDeComision(comisionId)
      .then(setInscripciones)
      .catch(() => setError("No se pudo cargar el listado de alumnos."));
  }, [comisionId]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!inscripciones) return <Typography color="text.secondary">Cargando...</Typography>;
  if (inscripciones.length === 0) {
    return <Typography color="text.secondary">Todavía no hay alumnos inscriptos.</Typography>;
  }

  return (
    <List>
      {inscripciones.map((i) => (
        <ListItem key={i.id} divider>
          <ListItemText
            primary={
              i.alumno_detalle.first_name
                ? `${i.alumno_detalle.first_name} ${i.alumno_detalle.last_name}`
                : i.alumno_detalle.username
            }
            secondary={`Inscripto el ${i.fecha_inscripcion}`}
          />
          <Chip label={i.estado} color={colorPorEstado[i.estado]} size="small" />
        </ListItem>
      ))}
    </List>
  );
}
