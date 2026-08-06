import {
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import { Link } from "react-router-dom";
import type { ItemAgenda } from "../../api/agenda";
import { ETIQUETA_ORIGEN, colorDeItem } from "../../utils/calendario";
import { formatearFechaLarga, formatearHora } from "../../utils/date";

interface Props {
  fechaIso: string;
  items: ItemAgenda[];
  onNuevoEvento: () => void;
  onEditarEvento: (eventoId: number) => void;
  onEliminarEvento: (eventoId: number) => void;
}

export function DetalleDia({
  fechaIso,
  items,
  onNuevoEvento,
  onEditarEvento,
  onEliminarEvento,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {formatearFechaLarga(fechaIso)}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={onNuevoEvento}>
          Agregar
        </Button>
      </Box>

      {items.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No hay nada agendado este día.
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((item) => (
            <ListItem
              key={`${item.origen}-${item.id}`}
              divider
              secondaryAction={
                item.origen === "evento" && (
                  <>
                    <IconButton
                      size="small"
                      title="Apuntes de este evento"
                      component={Link}
                      to={`/apuntes?evento=${item.id}`}
                    >
                      <NoteAddOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Editar"
                      onClick={() => onEditarEvento(item.id)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Eliminar"
                      color="error"
                      onClick={() => onEliminarEvento(item.id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </>
                )
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Chip size="small" color={colorDeItem(item)} label={item.tipo} />
                    <Typography variant="body2" component="span">
                      {item.titulo}
                    </Typography>
                  </Box>
                }
                secondary={
                  [
                    item.todo_el_dia
                      ? "Todo el día"
                      : `${formatearHora(item.hora_inicio)}–${formatearHora(item.hora_fin)}`,
                    item.materia_nombre,
                    item.lugar,
                    ETIQUETA_ORIGEN[item.origen],
                  ]
                    .filter(Boolean)
                    .join(" · ") + (item.descripcion ? ` — ${item.descripcion}` : "")
                }
                slotProps={{ secondary: { sx: { mt: 0.25 } } }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
