import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { CarrerasTab } from "./administracion/CarrerasTab";
import { MateriasTab } from "./administracion/MateriasTab";
import { ComisionesTab } from "./administracion/ComisionesTab";

const TABS = ["carreras", "materias", "comisiones"] as const;
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
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Carreras" value="carreras" />
          <Tab label="Materias" value="materias" />
          <Tab label="Comisiones" value="comisiones" />
        </Tabs>
      </Box>
      {tab === "carreras" && <CarrerasTab />}
      {tab === "materias" && <MateriasTab />}
      {tab === "comisiones" && <ComisionesTab />}
    </>
  );
}
