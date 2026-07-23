import { AppBar, Toolbar, Typography, Chip, Button, Container, Box } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Wordmark } from "./Wordmark";

const NAV_POR_ROL: Record<string, { to: string; label: string }[]> = {
  alumno: [
    { to: "/", label: "Mis comisiones" },
    { to: "/productividad", label: "Productividad" },
  ],
  docente: [{ to: "/", label: "Mis comisiones" }],
  administrativo: [{ to: "/", label: "Administración" }],
};

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const nav = usuario ? (NAV_POR_ROL[usuario.rol] ?? []) : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ mr: 2 }}>
            <Wordmark color="#fff" />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
            {nav.map((item) => (
              <Button key={item.to} color="inherit" component={Link} to={item.to}>
                {item.label}
              </Button>
            ))}
          </Box>
          {usuario && (
            <>
              <Chip label={usuario.rol} size="small" color="secondary" />
              <Typography variant="body2">{usuario.first_name || usuario.username}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Salir
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
