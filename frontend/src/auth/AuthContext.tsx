import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  cerrarSesion,
  iniciarSesion,
  obtenerCsrf,
  obtenerUsuarioActual,
  type Usuario,
} from "../api/auth";

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerCsrf()
      .then(() => obtenerUsuarioActual())
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  async function login(username: string, password: string) {
    const data = await iniciarSesion(username, password);
    setUsuario(data);
  }

  async function logout() {
    await cerrarSesion();
    setUsuario(null);
    await obtenerCsrf();
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
