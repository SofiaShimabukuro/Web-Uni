import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  crearEntrega,
  crearModulo,
  crearRecurso,
  obtenerEntregasDeModulo,
  obtenerModulosDeComision,
  obtenerRecursosDeModulo,
  type Entrega,
  type Modulo,
  type Recurso,
} from "../../api/cursos";

const TIPOS_RECURSO: Recurso["tipo"][] = ["archivo", "video", "link", "texto"];

interface ModuloCardProps {
  modulo: Modulo;
}

function ModuloCard({ modulo }: ModuloCardProps) {
  const [recursos, setRecursos] = useState<Recurso[] | null>(null);
  const [entregas, setEntregas] = useState<Entrega[] | null>(null);

  const [tituloRecurso, setTituloRecurso] = useState("");
  const [tipoRecurso, setTipoRecurso] = useState<Recurso["tipo"]>("link");
  const [urlRecurso, setUrlRecurso] = useState("");

  const [tituloEntrega, setTituloEntrega] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  function cargar() {
    obtenerRecursosDeModulo(modulo.id).then(setRecursos);
    obtenerEntregasDeModulo(modulo.id).then(setEntregas);
  }

  useEffect(cargar, [modulo.id]);

  async function agregarRecurso(event: FormEvent) {
    event.preventDefault();
    await crearRecurso({
      modulo: modulo.id,
      tipo: tipoRecurso,
      titulo: tituloRecurso,
      url_o_contenido: urlRecurso,
      orden: (recursos?.length ?? 0) + 1,
    });
    setTituloRecurso("");
    setUrlRecurso("");
    cargar();
  }

  async function agregarEntrega(event: FormEvent) {
    event.preventDefault();
    await crearEntrega({
      modulo: modulo.id,
      titulo: tituloEntrega,
      descripcion: "",
      fecha_limite: fechaEntrega,
      puntaje_maximo: "100",
    });
    setTituloEntrega("");
    setFechaEntrega("");
    cargar();
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {modulo.titulo}
      </Typography>

      {recursos && recursos.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
          {recursos.map((r) => (
            <Chip key={r.id} label={`${r.tipo}: ${r.titulo}`} size="small" />
          ))}
        </Box>
      )}
      {entregas && entregas.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
          {entregas.map((e) => (
            <Chip key={e.id} label={`Entrega: ${e.titulo} (${e.fecha_limite})`} size="small" color="secondary" />
          ))}
        </Box>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Box component="form" onSubmit={agregarRecurso} sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
        <TextField
          select
          size="small"
          label="Tipo"
          value={tipoRecurso}
          onChange={(e) => setTipoRecurso(e.target.value as Recurso["tipo"])}
          sx={{ minWidth: 110 }}
        >
          {TIPOS_RECURSO.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Título del recurso"
          value={tituloRecurso}
          onChange={(e) => setTituloRecurso(e.target.value)}
          required
        />
        <TextField
          size="small"
          label="URL / contenido"
          value={urlRecurso}
          onChange={(e) => setUrlRecurso(e.target.value)}
          required
          sx={{ flexGrow: 1, minWidth: 180 }}
        />
        <Button type="submit" size="small" variant="outlined">
          Agregar recurso
        </Button>
      </Box>

      <Box component="form" onSubmit={agregarEntrega} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <TextField
          size="small"
          label="Título de la entrega"
          value={tituloEntrega}
          onChange={(e) => setTituloEntrega(e.target.value)}
          required
        />
        <TextField
          size="small"
          label="Fecha límite"
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button type="submit" size="small" variant="outlined">
          Agregar entrega
        </Button>
      </Box>
    </Paper>
  );
}

interface Props {
  comisionId: number;
}

export function ContenidoTab({ comisionId }: Props) {
  const [modulos, setModulos] = useState<Modulo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tituloModulo, setTituloModulo] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    obtenerModulosDeComision(comisionId)
      .then(setModulos)
      .catch(() => setError("No se pudo cargar el contenido de la comisión."));
  }

  useEffect(cargar, [comisionId]);

  async function agregarModulo(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await crearModulo({ comision: comisionId, titulo: tituloModulo, orden: (modulos?.length ?? 0) + 1 });
      setTituloModulo("");
      cargar();
    } finally {
      setEnviando(false);
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!modulos) return <Typography color="text.secondary">Cargando...</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Nuevo módulo
        </Typography>
        <Box component="form" onSubmit={agregarModulo} sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Título"
            value={tituloModulo}
            onChange={(e) => setTituloModulo(e.target.value)}
            required
            sx={{ flexGrow: 1, maxWidth: 420 }}
          />
          <Button type="submit" variant="contained" disabled={enviando}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {modulos.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay módulos en esta comisión.</Typography>
      ) : (
        modulos.map((m) => <ModuloCard key={m.id} modulo={m} />)
      )}
    </Box>
  );
}
