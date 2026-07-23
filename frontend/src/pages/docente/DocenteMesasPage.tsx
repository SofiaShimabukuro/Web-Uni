import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/AuthContext";
import { obtenerMaterias, type Materia } from "../../api/cursos";
import {
  calificarInscripcionMesa,
  obtenerInscripcionesDeMesa,
  obtenerMesasExamen,
  type InscripcionMesa,
  type MesaExamen,
} from "../../api/tramites";

export function DocenteMesasPage() {
  const { usuario } = useAuth();
  const [mesas, setMesas] = useState<MesaExamen[] | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [mesaId, setMesaId] = useState<string>("");
  const [inscriptos, setInscriptos] = useState<InscripcionMesa[] | null>(null);
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([obtenerMesasExamen(), obtenerMaterias()])
      .then(([m, mat]) => {
        const propias = m.filter((mesa) => mesa.docente === usuario?.id);
        setMesas(propias);
        setMaterias(mat);
        if (propias.length > 0) setMesaId(String(propias[0].id));
      })
      .catch(() => setError("No se pudieron cargar tus mesas."));
  }, [usuario]);

  useEffect(() => {
    if (!mesaId) return;
    obtenerInscripcionesDeMesa(Number(mesaId)).then(setInscriptos);
  }, [mesaId]);

  async function calificar(insc: InscripcionMesa, estado: "aprobado" | "desaprobado") {
    const notaTexto = notas[insc.id];
    if (!notaTexto) return;
    const actualizado = await calificarInscripcionMesa(insc.id, Number(notaTexto), estado);
    setInscriptos((prev) => prev?.map((i) => (i.id === insc.id ? actualizado : i)) ?? null);
  }

  function nombreMateria(id: number) {
    const m = materias?.find((x) => x.id === id);
    return m ? `${m.codigo} — ${m.nombre}` : `Materia #${id}`;
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!mesas || !materias) return <Typography color="text.secondary">Cargando...</Typography>;

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Mesas de examen
      </Typography>

      {mesas.length === 0 ? (
        <Typography color="text.secondary">Todavía no presidís ninguna mesa.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Mesa"
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
            sx={{ maxWidth: 360 }}
          >
            {mesas.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {nombreMateria(m.materia)} · {m.fecha} ({m.tipo})
              </MenuItem>
            ))}
          </TextField>

          {!inscriptos ? (
            <Typography color="text.secondary">Cargando inscriptos...</Typography>
          ) : inscriptos.length === 0 ? (
            <Typography color="text.secondary">Todavía nadie se inscribió a esta mesa.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {inscriptos.map((insc) => (
                <Box
                  key={insc.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ flexGrow: 1 }}>
                    {insc.alumno_detalle.first_name
                      ? `${insc.alumno_detalle.first_name} ${insc.alumno_detalle.last_name}`
                      : insc.alumno_detalle.username}
                  </Typography>
                  <Chip label={insc.estado} size="small" />
                  {insc.estado === "inscripto" ? (
                    <>
                      <TextField
                        size="small"
                        label="Nota"
                        type="number"
                        value={notas[insc.id] ?? ""}
                        onChange={(e) => setNotas((prev) => ({ ...prev, [insc.id]: e.target.value }))}
                        sx={{ maxWidth: 100 }}
                      />
                      <Button size="small" color="success" variant="contained" onClick={() => calificar(insc, "aprobado")}>
                        Aprobar
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => calificar(insc, "desaprobado")}>
                        Desaprobar
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2">Nota: {insc.nota ?? "—"}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
