import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import PublicIcon from "@mui/icons-material/Public";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  actualizarVisibilidadApunte,
  descargarArchivoApunte,
  eliminarApunte,
  type Apunte,
} from "../../api/agenda";

const EXTENSIONES_AUDIO = ["mp3", "m4a", "wav", "ogg", "opus"];
const EXTENSIONES_VIDEO = ["mp4", "webm", "mov"];

function extension(apunte: Apunte) {
  return apunte.nombre_archivo.split(".").pop()?.toLowerCase() ?? "";
}

function esReproducible(apunte: Apunte) {
  if (!apunte.archivo_url) return false;
  const ext = extension(apunte);
  return EXTENSIONES_AUDIO.includes(ext) || EXTENSIONES_VIDEO.includes(ext);
}

function formatearTamano(bytes: number | null): string {
  if (bytes === null) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const ICONO_POR_TIPO = {
  apunte: <DescriptionOutlinedIcon />,
  grabacion: <GraphicEqIcon />,
  enlace: <LinkIcon />,
};

interface Props {
  apuntes: Apunte[];
  onCambio: () => void;
}

export function ListaApuntes({ apuntes, onCambio }: Props) {
  const [reproduciendo, setReproduciendo] = useState<{ apunte: Apunte; url: string } | null>(null);

  async function descargar(apunte: Apunte) {
    const url = await descargarArchivoApunte(apunte);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = apunte.nombre_archivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  async function reproducir(apunte: Apunte) {
    setReproduciendo({ apunte, url: await descargarArchivoApunte(apunte) });
  }

  function cerrarReproductor() {
    if (reproduciendo) URL.revokeObjectURL(reproduciendo.url);
    setReproduciendo(null);
  }

  async function borrar(apunte: Apunte) {
    if (!confirm(`¿Eliminar "${apunte.titulo}"?`)) return;
    await eliminarApunte(apunte.id);
    onCambio();
  }

  async function alternarVisibilidad(apunte: Apunte) {
    await actualizarVisibilidadApunte(
      apunte.id,
      apunte.visibilidad === "privado" ? "comision" : "privado",
    );
    onCambio();
  }

  if (apuntes.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No hay apuntes acá todavía.
      </Typography>
    );
  }

  return (
    <>
      <List>
        {apuntes.map((apunte) => (
          <ListItem
            key={apunte.id}
            divider
            secondaryAction={
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {esReproducible(apunte) && (
                  <IconButton title="Reproducir" onClick={() => reproducir(apunte)}>
                    <PlayArrowIcon />
                  </IconButton>
                )}
                {apunte.archivo_url && (
                  <IconButton title="Descargar" onClick={() => descargar(apunte)}>
                    <DownloadIcon />
                  </IconButton>
                )}
                {apunte.enlace && (
                  <IconButton
                    title="Abrir enlace"
                    component="a"
                    href={apunte.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon />
                  </IconButton>
                )}
                {apunte.es_propio && (
                  <>
                    <IconButton
                      title={
                        apunte.visibilidad === "privado"
                          ? "Compartir con la comisión"
                          : "Volver a privado"
                      }
                      onClick={() => alternarVisibilidad(apunte)}
                      disabled={apunte.visibilidad === "privado" && !apunte.materia}
                    >
                      {apunte.visibilidad === "privado" ? <LockOutlinedIcon /> : <PublicIcon />}
                    </IconButton>
                    <IconButton title="Eliminar" color="error" onClick={() => borrar(apunte)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            }
          >
            <ListItemIcon>{ICONO_POR_TIPO[apunte.tipo]}</ListItemIcon>
            <ListItemText
              primary={apunte.titulo}
              secondary={
                <Box component="span" sx={{ display: "block" }}>
                  {[
                    apunte.materia_nombre,
                    apunte.evento_titulo,
                    apunte.nombre_archivo,
                    formatearTamano(apunte.tamano_bytes),
                    new Date(apunte.creado_en).toLocaleDateString("es-AR"),
                    apunte.es_propio ? null : `Subido por ${apunte.autor}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  {apunte.descripcion && (
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ display: "block" }}>
                      {apunte.descripcion}
                    </Typography>
                  )}
                  {apunte.visibilidad === "comision" && (
                    <Chip
                      component="span"
                      size="small"
                      color="info"
                      label="Compartido con la comisión"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              }
              slotProps={{ secondary: { component: "div" } }}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={!!reproduciendo} onClose={cerrarReproductor} fullWidth maxWidth="md">
        {reproduciendo && (
          <>
            <DialogTitle>{reproduciendo.apunte.titulo}</DialogTitle>
            <DialogContent>
              {EXTENSIONES_VIDEO.includes(extension(reproduciendo.apunte)) ? (
                <video src={reproduciendo.url} controls autoPlay style={{ width: "100%" }} />
              ) : (
                <audio src={reproduciendo.url} controls autoPlay style={{ width: "100%" }} />
              )}
              <Box sx={{ mt: 2 }}>
                <Button onClick={cerrarReproductor}>Cerrar</Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
