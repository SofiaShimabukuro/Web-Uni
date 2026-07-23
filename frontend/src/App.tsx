import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RutaProtegida } from "./components/RutaProtegida";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ComisionDetailPage } from "./pages/ComisionDetailPage";
import { ProductividadPage } from "./pages/ProductividadPage";
import { DocenteComisionPage } from "./pages/docente/DocenteComisionPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RutaProtegida>
                <AppLayout />
              </RutaProtegida>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/comisiones/:comisionId" element={<ComisionDetailPage />} />
            <Route path="/productividad" element={<ProductividadPage />} />
            <Route path="/docente/comisiones/:comisionId" element={<DocenteComisionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
