import { Box, Typography } from "@mui/material";

const SERIF_STACK = '"Iowan Old Style", "Palatino Linotype", Georgia, "Times New Roman", serif';

interface Props {
  /** Muestra la línea de crédito académico debajo del nombre. */
  conSubtitulo?: boolean;
  /** Color del texto; por defecto hereda (útil sobre el fondo navy del header). */
  color?: string;
}

export function Wordmark({ conSubtitulo = false, color = "inherit" }: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "baseline",
          fontFamily: SERIF_STACK,
          letterSpacing: "0.02em",
          color,
        }}
      >
        <Box component="span" sx={{ fontSize: "1.7rem", lineHeight: 1 }}>
          W
        </Box>
        <Box component="span" sx={{ fontSize: "1.05rem" }}>
          eb
        </Box>
        <Box component="span" sx={{ fontSize: "1.05rem", mx: "0.12em" }}>
          -
        </Box>
        <Box component="span" sx={{ fontSize: "1.7rem", lineHeight: 1 }}>
          U
        </Box>
        <Box component="span" sx={{ fontSize: "1.05rem" }}>
          ni
        </Box>
      </Box>
      {conSubtitulo && (
        <Typography
          component="span"
          sx={{
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: 0.75,
            color,
          }}
        >
          Proyecto académico · Universidad de Piura
        </Typography>
      )}
    </Box>
  );
}
