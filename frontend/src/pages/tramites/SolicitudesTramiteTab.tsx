import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  crearSolicitudTramite,
  obtenerSolicitudesTramite,
  type SolicitudTramite,
  type TipoSolicitudTramite,
} from "../../api/tramites";

const TIPOS: { value: TipoSolicitudTramite; label: string }[] = [
  { value: "certificado_alumno_regular", label: "Certificado de alumno regular" },
  { value: "certificado_analitico", label: "Certificado analítico" },
  { value: "constancia_titulo_en_tramite", label: "Constancia de título en trámite" },
];

const colorPorEstado: Record<SolicitudTramite["estado"], "default" | "success" | "error"> = {
  pendiente: "default",
  emitido: "success",
  rechazado: "error",
};

export function SolicitudesTramiteTab() {
  const [solicitudes, setSolicitudes] = useState<SolicitudTramite[] | null>(null);
  const [tipo, setTipo] = useState<TipoSolicitudTramite>("certificado_alumno_regular");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    obtenerSolicitudesTramite()
      .then(setSolicitudes)
      .catch(() => setError("No se pudieron cargar tus solicitudes."));
  }

  useEffect(cargar, []);

  async function handleSubmit() {
    setEnviando(true);
    try {
      await crearSolicitudTramite(tipo);
      cargar();
    } finally {
      setEnviando(false);
    }
  }

  function etiqueta(t: TipoSolicitudTramite) {
    return TIPOS.find((x) => x.value === t)?.label ?? t;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nueva solicitud
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            select
            label="Tipo de trámite"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoSolicitudTramite)}
            sx={{ minWidth: 280 }}
          >
            {TIPOS.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" disabled={enviando} onClick={handleSubmit}>
            Solicitar
          </Button>
        </Box>
      </Paper>

      {!solicitudes ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : solicitudes.length === 0 ? (
        <Typography color="text.secondary">Todavía no pediste ningún trámite.</Typography>
      ) : (
        <List>
          {solicitudes.map((s) => (
            <ListItem key={s.id} divider>
              <ListItemText primary={etiqueta(s.tipo)} secondary={`Pedido el ${s.fecha_solicitud}`} />
              <Chip label={s.estado} color={colorPorEstado[s.estado]} size="small" />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
