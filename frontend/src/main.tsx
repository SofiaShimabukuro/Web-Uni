import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import App from "./App.tsx";

const SERIF_DISPLAY = '"Iowan Old Style", "Palatino Linotype", Georgia, "Times New Roman", serif';

const theme = createTheme({
  palette: {
    mode: "light",
    // Azul institucional (Universidad de Piura), tomado como referencia de color.
    primary: { main: "#163a63", light: "#3f6690", dark: "#0d2440" },
    // Dorado académico, como acento secundario (no forma parte del isotipo, solo de la UI).
    secondary: { main: "#96742f", light: "#c2a565", dark: "#6b5220" },
  },
  typography: {
    h1: { fontFamily: SERIF_DISPLAY },
    h2: { fontFamily: SERIF_DISPLAY },
    h3: { fontFamily: SERIF_DISPLAY },
    h4: { fontFamily: SERIF_DISPLAY },
    h5: { fontFamily: SERIF_DISPLAY, fontWeight: 600 },
    h6: { fontFamily: SERIF_DISPLAY, fontWeight: 600 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
