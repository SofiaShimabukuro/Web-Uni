import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import { Alert, Box, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { obtenerComision, obtenerMaterias, type Comision, type Materia } from "../../api/cursos";
import { ContenidoTab } from "./ContenidoTab";
import { AlumnosTab } from "./AlumnosTab";
import { CalificarTab } from "./CalificarTab";

const TABS = ["contenido", "alumnos", "calificar"] as const;
type TabKey = (typeof TABS)[number];

export function DocenteComisionPage() {
  const { comisionId } = useParams<{ comisionId: string }>();
  const [comision, setComision] = useState<Comision | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("contenido");

  useEffect(() => {
    if (!comisionId) return;
    Promise.all([obtenerComision(Number(comisionId)), obtenerMaterias()])
      .then(([c, m]) => {
        setComision(c);
        setMaterias(m);
      })
      .catch(() => setError("No se pudo cargar la comisión."));
  }, [comisionId]);

  function handleChange(_event: SyntheticEvent, nuevoValor: TabKey) {
    setTab(nuevoValor);
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!comision || !materias || !comisionId) return <CircularProgress />;

  const materia = materias.find((m) => m.id === comision.materia);
  const comisionIdNum = Number(comisionId);

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        {materia ? `${materia.codigo} — ${materia.nombre}` : `Comisión #${comisionId}`}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {comision.periodo} · Aula {comision.aula || "s/d"} · Cupo {comision.cupo}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, mt: 2 }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Contenido" value="contenido" />
          <Tab label="Alumnos" value="alumnos" />
          <Tab label="Calificar" value="calificar" />
        </Tabs>
      </Box>
      {tab === "contenido" && <ContenidoTab comisionId={comisionIdNum} />}
      {tab === "alumnos" && <AlumnosTab comisionId={comisionIdNum} />}
      {tab === "calificar" && <CalificarTab comisionId={comisionIdNum} />}
    </>
  );
}
