import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { obtenerAlumnos } from "../../api/usuarios";
import type { Usuario } from "../../api/auth";
import {
  obtenerSolicitudesTramite,
  resolverSolicitudTramite,
  type SolicitudTramite,
  type TipoSolicitudTramite,
} from "../../api/tramites";

const ETIQUETAS: Record<TipoSolicitudTramite, string> = {
  certificado_alumno_regular: "Certificado de alumno regular",
  certificado_analitico: "Certificado analítico",
  constancia_titulo_en_tramite: "Constancia de título en trámite",
};

const colorPorEstado: Record<SolicitudTramite["estado"], "default" | "success" | "error"> = {
  pendiente: "default",
  emitido: "success",
  rechazado: "error",
};

export function SolicitudesAdminTab() {
  const [solicitudes, setSolicitudes] = useState<SolicitudTramite[] | null>(null);
  const [alumnos, setAlumnos] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    Promise.all([obtenerSolicitudesTramite(), obtenerAlumnos()])
      .then(([s, a]) => {
        setSolicitudes(s);
        setAlumnos(a);
      })
      .catch(() => setError("No se pudieron cargar las solicitudes."));
  }

  useEffect(cargar, []);

  async function resolver(id: number, estado: "emitido" | "rechazado") {
    await resolverSolicitudTramite(id, estado);
    cargar();
  }

  function nombreAlumno(id: number) {
    const a = alumnos?.find((x) => x.id === id);
    return a ? (a.first_name ? `${a.first_name} ${a.last_name}` : a.username) : `Alumno #${id}`;
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!solicitudes) return <Typography color="text.secondary">Cargando...</Typography>;
  if (solicitudes.length === 0) {
    return <Typography color="text.secondary">No hay solicitudes de trámite.</Typography>;
  }

  return (
    <List>
      {solicitudes.map((s) => (
        <ListItem key={s.id} divider>
          <ListItemText
            primary={`${nombreAlumno(s.alumno)} · ${ETIQUETAS[s.tipo]}`}
            secondary={`Pedido el ${s.fecha_solicitud}`}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {s.estado === "pendiente" ? (
              <>
                <Button size="small" color="success" variant="contained" onClick={() => resolver(s.id, "emitido")}>
                  Emitir
                </Button>
                <Button size="small" color="error" variant="outlined" onClick={() => resolver(s.id, "rechazado")}>
                  Rechazar
                </Button>
              </>
            ) : (
              <Chip label={s.estado} color={colorPorEstado[s.estado]} size="small" />
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
}
