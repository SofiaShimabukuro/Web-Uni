import { AppBar, Toolbar, Typography, Chip, Button, Container, Box } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Web-Uni
          </Typography>
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
