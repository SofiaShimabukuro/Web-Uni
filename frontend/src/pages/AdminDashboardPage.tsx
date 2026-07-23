import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { CarrerasTab } from "./administracion/CarrerasTab";
import { MateriasTab } from "./administracion/MateriasTab";
import { ComisionesTab } from "./administracion/ComisionesTab";
import { MesasExamenAdminTab } from "./administracion/MesasExamenAdminTab";
import { SolicitudesAdminTab } from "./administracion/SolicitudesAdminTab";

const TABS = ["carreras", "materias", "comisiones", "mesas", "tramites"] as const;
type TabKey = (typeof TABS)[number];

export function AdminDashboardPage() {
  const [tab, setTab] = useState<TabKey>("carreras");

  function handleChange(_event: SyntheticEvent, nuevoValor: TabKey) {
    setTab(nuevoValor);
  }

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Administración académica
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Carreras" value="carreras" />
          <Tab label="Materias" value="materias" />
          <Tab label="Comisiones" value="comisiones" />
          <Tab label="Mesas de examen" value="mesas" />
          <Tab label="Trámites" value="tramites" />
        </Tabs>
      </Box>
      {tab === "carreras" && <CarrerasTab />}
      {tab === "materias" && <MateriasTab />}
      {tab === "comisiones" && <ComisionesTab />}
      {tab === "mesas" && <MesasExamenAdminTab />}
      {tab === "tramites" && <SolicitudesAdminTab />}
    </>
  );
}
