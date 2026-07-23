import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Button, Paper, TextField, Typography, Alert } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { Wordmark } from "../components/Wordmark";

export function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Usuario o contraseña inválidos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        px: 2,
        bgcolor: "primary.dark",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 380 }} elevation={6}>
        <Box sx={{ mb: 3 }}>
          <Wordmark conSubtitulo />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresá con tu usuario para ver tus comisiones.
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
