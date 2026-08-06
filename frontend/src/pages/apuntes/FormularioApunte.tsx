import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { Materia } from "../../api/cursos";
import {
  crearApunte,
  type EventoCalendario,
  type TipoApunte,
  type VisibilidadApunte,
} from "../../api/agenda";

const TIPOS: { value: TipoApunte; label: string; ayuda: string }[] = [
  { value: "apunte", label: "Apunte", ayuda: "PDF, Word, fotos de la carpeta, planillas…" },
  { value: "grabacion", label: "Grabación", ayuda: "Audio o video de la clase" },
  { value: "enlace", label: "Enlace", ayuda: "Drive, YouTube, OneDrive…" },
];

interface Props {
  materias: Materia[];
  eventos: EventoCalendario[];
  onSubido: () => void;
}

export function FormularioApunte({ materias, eventos, onSubido }: Props) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoApunte>("apunte");
  const [materiaId, setMateriaId] = useState("");
  const [eventoId, setEventoId] = useState("");
  const [visibilidad, setVisibilidad] = useState<VisibilidadApunte>("privado");
  const [descripcion, setDescripcion] = useState("");
  const [enlace, setEnlace] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const esEnlace = tipo === "enlace";

  function limpiar() {
    setTitulo("");
    setDescripcion("");
    setEnlace("");
    setArchivo(null);
    setEventoId("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!esEnlace && !archivo) {
      setError("Elegí el archivo que querés subir.");
      return;
    }
    if (visibilidad === "comision" && !materiaId) {
      setError("Para compartir con la comisión tenés que elegir la materia.");
      return;
    }
    setSubiendo(true);
    try {
      await crearApunte({
        titulo,
        descripcion,
        tipo,
        materia: materiaId ? Number(materiaId) : null,
        evento: eventoId ? Number(eventoId) : null,
        visibilidad,
        enlace: esEnlace ? enlace : "",
        archivo: esEnlace ? null : archivo,
      });
      limpiar();
      onSubido();
    } catch {
      setError(
        "No se pudo subir. Revisá el tamaño (hay un máximo por archivo) y que la extensión esté permitida.",
      );
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Subir apunte o grabación
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            sx={{ flexGrow: 1, minWidth: 220 }}
          />
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoApunte)}
            helperText={TIPOS.find((t) => t.value === tipo)?.ayuda}
            sx={{ minWidth: 180 }}
          >
            {TIPOS.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            select
            label="Materia (opcional)"
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
          >
            <MenuItem value="">Sin materia</MenuItem>
            {materias.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.codigo} — {m.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Clase del calendario (opcional)"
            value={eventoId}
            onChange={(e) => setEventoId(e.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
          >
            <MenuItem value="">Sin vincular</MenuItem>
            {eventos.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.fecha} — {e.titulo}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Visibilidad"
            value={visibilidad}
            onChange={(e) => setVisibilidad(e.target.value as VisibilidadApunte)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="privado">Solo yo</MenuItem>
            <MenuItem value="comision">Compartir con la comisión</MenuItem>
          </TextField>
        </Box>

        {esEnlace ? (
          <TextField
            label="Enlace"
            type="url"
            placeholder="https://drive.google.com/..."
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            required
            fullWidth
          />
        ) : (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              Elegir archivo
              <input
                hidden
                type="file"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </Button>
            {archivo && <Chip label={archivo.name} onDelete={() => setArchivo(null)} />}
          </Box>
        )}

        <TextField
          label="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />

        <Box>
          <Button type="submit" variant="contained" disabled={subiendo}>
            {subiendo ? "Subiendo..." : "Subir"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
