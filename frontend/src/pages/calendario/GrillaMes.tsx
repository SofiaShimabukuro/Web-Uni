import { Box, Chip, Paper, Typography } from "@mui/material";
import type { ItemAgenda } from "../../api/agenda";
import { DIAS_SEMANA, colorDeItem, diasDeGrilla } from "../../utils/calendario";
import { fechaISO, formatearHora } from "../../utils/date";

const MAXIMO_VISIBLE_POR_DIA = 3;

interface Props {
  anio: number;
  mes: number;
  itemsPorFecha: Map<string, ItemAgenda[]>;
  fechaSeleccionada: string;
  onSeleccionarDia: (fechaIso: string) => void;
}

export function GrillaMes({ anio, mes, itemsPorFecha, fechaSeleccionada, onSeleccionarDia }: Props) {
  const hoy = fechaISO(new Date());

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {DIAS_SEMANA.map((dia) => (
          <Typography
            key={dia}
            variant="caption"
            align="center"
            sx={{ py: 1, fontWeight: 600, bgcolor: "action.hover" }}
          >
            {dia}
          </Typography>
        ))}
        {diasDeGrilla(anio, mes).map((dia) => {
          const iso = fechaISO(dia);
          const items = itemsPorFecha.get(iso) ?? [];
          const esDelMes = dia.getMonth() === mes;
          const seleccionado = iso === fechaSeleccionada;
          return (
            <Box
              key={iso}
              onClick={() => onSeleccionarDia(iso)}
              sx={{
                minHeight: 96,
                p: 0.5,
                borderTop: 1,
                borderRight: 1,
                borderColor: "divider",
                cursor: "pointer",
                bgcolor: seleccionado ? "action.selected" : undefined,
                opacity: esDelMes ? 1 : 0.45,
                "&:hover": { bgcolor: "action.hover" },
                "&:nth-of-type(7n)": { borderRight: 0 },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  fontWeight: iso === hoy ? 700 : 400,
                  bgcolor: iso === hoy ? "primary.main" : undefined,
                  color: iso === hoy ? "primary.contrastText" : undefined,
                }}
              >
                {dia.getDate()}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, mt: 0.25 }}>
                {items.slice(0, MAXIMO_VISIBLE_POR_DIA).map((item) => (
                  <Chip
                    key={`${item.origen}-${item.id}-${item.fecha}`}
                    size="small"
                    color={colorDeItem(item)}
                    variant={item.origen === "evento" ? "filled" : "outlined"}
                    label={
                      item.todo_el_dia
                        ? item.titulo
                        : `${formatearHora(item.hora_inicio)} ${item.titulo}`
                    }
                    sx={{
                      maxWidth: "100%",
                      height: 20,
                      "& .MuiChip-label": { px: 0.75, fontSize: "0.68rem" },
                    }}
                  />
                ))}
                {items.length > MAXIMO_VISIBLE_POR_DIA && (
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                    +{items.length - MAXIMO_VISIBLE_POR_DIA} más
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
