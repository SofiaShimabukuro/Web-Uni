import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { MesasExamenTab } from "./tramites/MesasExamenTab";
import { LegajoTab } from "./tramites/LegajoTab";
import { SolicitudesTramiteTab } from "./tramites/SolicitudesTramiteTab";

const TABS = ["mesas", "legajo", "tramites"] as const;
type TabKey = (typeof TABS)[number];

export function TramitesPage() {
  const [tab, setTab] = useState<TabKey>("mesas");

  function handleChange(_event: SyntheticEvent, nuevoValor: TabKey) {
    setTab(nuevoValor);
  }

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Legajo y trámites
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Mesas de examen" value="mesas" />
          <Tab label="Legajo" value="legajo" />
          <Tab label="Trámites" value="tramites" />
        </Tabs>
      </Box>
      {tab === "mesas" && <MesasExamenTab />}
      {tab === "legajo" && <LegajoTab />}
      {tab === "tramites" && <SolicitudesTramiteTab />}
    </>
  );
}
