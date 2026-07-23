import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Box,
} from "@mui/material";
import {
  obtenerModulosDeComision,
  obtenerRecursosDeModulo,
  obtenerEntregasDeModulo,
  type Modulo,
  type Recurso,
  type Entrega,
} from "../api/cursos";

interface ModuloConContenido extends Modulo {
  recursos: Recurso[];
  entregas: Entrega[];
}

export function ComisionDetailPage() {
  const { comisionId } = useParams<{ comisionId: string }>();
  const [modulos, setModulos] = useState<ModuloConContenido[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!comisionId) return;
    obtenerModulosDeComision(Number(comisionId))
      .then(async (modulosBase) => {
        const modulosConContenido = await Promise.all(
          modulosBase.map(async (modulo) => {
            const [recursos, entregas] = await Promise.all([
              obtenerRecursosDeModulo(modulo.id),
              obtenerEntregasDeModulo(modulo.id),
            ]);
            return { ...modulo, recursos, entregas };
          }),
        );
        setModulos(modulosConContenido);
      })
      .catch(() => setError("No se pudo cargar el contenido de la comisión."));
  }, [comisionId]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!modulos) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Contenido de la comisión
      </Typography>
      {modulos.length === 0 && (
        <Typography color="text.secondary">Todavía no hay módulos cargados.</Typography>
      )}
      {modulos.map((modulo) => (
        <Box key={modulo.id} sx={{ mb: 3 }}>
          <Typography variant="h6">{modulo.titulo}</Typography>
          <List dense>
            {modulo.recursos.map((recurso) => (
              <ListItem key={`recurso-${recurso.id}`}>
                <ListItemText
                  primary={recurso.titulo}
                  secondary={<Chip label={recurso.tipo} size="small" component="span" />}
                />
              </ListItem>
            ))}
            {modulo.entregas.map((entrega) => (
              <ListItem key={`entrega-${entrega.id}`}>
                <ListItemText primary={entrega.titulo} secondary={`Entrega: ${entrega.fecha_limite}`} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      ))}
    </>
  );
}
