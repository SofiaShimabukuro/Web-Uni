import { useEffect, useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs, Typography, CircularProgress, Alert } from "@mui/material";
import { obtenerMaterias, type Materia } from "../api/cursos";
import { BloquesEstudioTab } from "./productividad/BloquesEstudioTab";
import { HabitosTab } from "./productividad/HabitosTab";
import { RepasoEspaciadoTab } from "./productividad/RepasoEspaciadoTab";
import { AutoevaluacionesTab } from "./productividad/AutoevaluacionesTab";

const TABS = ["planificador", "habitos", "repaso", "autoevaluaciones"] as const;
type TabKey = (typeof TABS)[number];

export function ProductividadPage() {
  const [tab, setTab] = useState<TabKey>("planificador");
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerMaterias()
      .then(setMaterias)
      .catch(() => setError("No se pudo cargar el listado de materias."));
  }, []);

  function handleChange(_event: SyntheticEvent, nuevoValor: TabKey) {
    setTab(nuevoValor);
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!materias) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Productividad y desempeño
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Planificador" value="planificador" />
          <Tab label="Hábitos" value="habitos" />
          <Tab label="Repaso espaciado" value="repaso" />
          <Tab label="Autoevaluaciones" value="autoevaluaciones" />
        </Tabs>
      </Box>
      {tab === "planificador" && <BloquesEstudioTab materias={materias} />}
      {tab === "habitos" && <HabitosTab />}
      {tab === "repaso" && <RepasoEspaciadoTab materias={materias} />}
      {tab === "autoevaluaciones" && <AutoevaluacionesTab materias={materias} />}
    </>
  );
}
