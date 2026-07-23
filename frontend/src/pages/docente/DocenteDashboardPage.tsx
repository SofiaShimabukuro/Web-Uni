import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Card, CardActionArea, CardContent, CircularProgress, Typography } from "@mui/material";
import { obtenerComisiones, obtenerMaterias, type Comision, type Materia } from "../../api/cursos";

export function DocenteDashboardPage() {
  const [comisiones, setComisiones] = useState<Comision[] | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([obtenerComisiones(), obtenerMaterias()])
      .then(([c, m]) => {
        setComisiones(c);
        setMaterias(m);
      })
      .catch(() => setError("No se pudieron cargar tus comisiones."));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!comisiones || !materias) return <CircularProgress />;

  function materia(id: number) {
    return materias?.find((m) => m.id === id);
  }

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Mis comisiones a cargo
      </Typography>
      {comisiones.length === 0 && (
        <Typography color="text.secondary">Todavía no tenés comisiones asignadas.</Typography>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2 }}>
        {comisiones.map((c) => {
          const m = materia(c.materia);
          return (
            <Card key={c.id} variant="outlined">
              <CardActionArea onClick={() => navigate(`/docente/comisiones/${c.id}`)}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    {m?.codigo ?? `Materia #${c.materia}`}
                  </Typography>
                  <Typography variant="h6">{m?.nombre ?? "—"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.periodo} · Aula {c.aula || "s/d"} · Cupo {c.cupo}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </>
  );
}
