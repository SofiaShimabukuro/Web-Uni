import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import {
  obtenerApuntes,
  obtenerEventos,
  type Apunte,
  type EventoCalendario,
  type TipoApunte,
} from "../api/agenda";
import { obtenerMaterias, type Materia } from "../api/cursos";
import { FormularioApunte } from "./apuntes/FormularioApunte";
import { ListaApuntes } from "./apuntes/ListaApuntes";

const TABS = ["mios", "comision"] as const;
type TabKey = (typeof TABS)[number];

export function ApuntesPage() {
  const [parametros, setParametros] = useSearchParams();
  const eventoFiltrado = parametros.get("evento");

  const [tab, setTab] = useState<TabKey>("mios");
  const [materiaId, setMateriaId] = useState("");
  const [tipo, setTipo] = useState<TipoApunte | "">("");

  const [apuntes, setApuntes] = useState<Apunte[] | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargarApuntes = useCallback(() => {
    obtenerApuntes({
      propios: tab === "mios",
      materia: materiaId ? Number(materiaId) : undefined,
      tipo: tipo || undefined,
      evento: eventoFiltrado ? Number(eventoFiltrado) : undefined,
    })
      .then(setApuntes)
      .catch(() => setError("No se pudieron cargar los apuntes."));
  }, [tab, materiaId, tipo, eventoFiltrado]);

  useEffect(cargarApuntes, [cargarApuntes]);

  useEffect(() => {
    Promise.all([obtenerMaterias(), obtenerEventos()])
      .then(([materias, eventos]) => {
        setMaterias(materias);
        setEventos(eventos);
      })
      .catch(() => setError("No se pudo cargar el listado de materias y eventos."));
  }, []);

  function handleTab(_event: SyntheticEvent, nuevo: TabKey) {
    setTab(nuevo);
    setApuntes(null);
  }

  const eventoDelFiltro = eventos.find((e) => String(e.id) === eventoFiltrado);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Apuntes y grabaciones
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={handleTab}>
          <Tab label="Mis apuntes" value="mios" />
          <Tab label="De mis comisiones" value="comision" />
        </Tabs>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {tab === "mios" && (
          <FormularioApunte materias={materias} eventos={eventos} onSubido={cargarApuntes} />
        )}

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            select
            size="small"
            label="Materia"
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {materias.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoApunte | "")}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="apunte">Apuntes</MenuItem>
            <MenuItem value="grabacion">Grabaciones</MenuItem>
            <MenuItem value="enlace">Enlaces</MenuItem>
          </TextField>
          {eventoFiltrado && (
            <Chip
              label={`Evento: ${eventoDelFiltro?.titulo ?? `#${eventoFiltrado}`}`}
              onDelete={() => setParametros({})}
            />
          )}
        </Box>

        {!apuntes ? <CircularProgress /> : <ListaApuntes apuntes={apuntes} onCambio={cargarApuntes} />}
      </Box>
    </>
  );
}
