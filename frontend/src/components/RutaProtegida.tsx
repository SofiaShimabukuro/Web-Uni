import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

export function RutaProtegida({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
