import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { obtenerMaterias, type Materia } from "../../api/cursos";
import {
  inscribirseAMesa,
  obtenerMesasExamen,
  obtenerMisInscripcionesMesa,
  type InscripcionMesa,
  type MesaExamen,
} from "../../api/tramites";

const colorPorEstado: Record<InscripcionMesa["estado"], "primary" | "default" | "success" | "error"> = {
  inscripto: "primary",
  aprobado: "success",
  desaprobado: "error",
  ausente: "default",
};

export function MesasExamenTab() {
  const [mesas, setMesas] = useState<MesaExamen[] | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [inscripciones, setInscripciones] = useState<InscripcionMesa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorInscripcion, setErrorInscripcion] = useState<string | null>(null);

  function cargar() {
    Promise.all([obtenerMesasExamen(), obtenerMaterias(), obtenerMisInscripcionesMesa()])
      .then(([m, mat, insc]) => {
        setMesas(m);
        setMaterias(mat);
        setInscripciones(insc);
      })
      .catch(() => setError("No se pudieron cargar las mesas de examen."));
  }

  useEffect(cargar, []);

  async function inscribirse(mesaId: number) {
    setErrorInscripcion(null);
    try {
      await inscribirseAMesa(mesaId);
      cargar();
    } catch {
      setErrorInscripcion(
        "No pudimos inscribirte: solo podés anotarte a mesas de materias que cursaste.",
      );
    }
  }

  function nombreMateria(id: number) {
    const m = materias?.find((x) => x.id === id);
    return m ? `${m.codigo} — ${m.nombre}` : `Materia #${id}`;
  }

  function inscripcionDe(mesaId: number) {
    return inscripciones?.find((i) => i.mesa === mesaId) ?? null;
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!mesas || !materias || !inscripciones) {
    return <Typography color="text.secondary">Cargando...</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {errorInscripcion && <Alert severity="error">{errorInscripcion}</Alert>}
      {mesas.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay mesas convocadas.</Typography>
      ) : (
        <List>
          {mesas.map((mesa) => {
            const inscripcion = inscripcionDe(mesa.id);
            return (
              <ListItem key={mesa.id} divider>
                <ListItemText
                  primary={`${nombreMateria(mesa.materia)} · ${mesa.tipo}`}
                  secondary={`Fecha: ${mesa.fecha}`}
                />
                {inscripcion ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={inscripcion.nota ? `${inscripcion.estado} (${inscripcion.nota})` : inscripcion.estado}
                      color={colorPorEstado[inscripcion.estado]}
                      size="small"
                    />
                  </Box>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => inscribirse(mesa.id)}>
                    Inscribirme
                  </Button>
                )}
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}
