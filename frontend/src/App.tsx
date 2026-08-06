import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RutaProtegida } from "./components/RutaProtegida";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ComisionDetailPage } from "./pages/ComisionDetailPage";
import { ProductividadPage } from "./pages/ProductividadPage";
import { CalendarioPage } from "./pages/CalendarioPage";
import { ApuntesPage } from "./pages/ApuntesPage";
import { TramitesPage } from "./pages/TramitesPage";
import { DocenteComisionPage } from "./pages/docente/DocenteComisionPage";
import { DocenteMesasPage } from "./pages/docente/DocenteMesasPage";

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
            <Route path="/calendario" element={<CalendarioPage />} />
            <Route path="/apuntes" element={<ApuntesPage />} />
            <Route path="/productividad" element={<ProductividadPage />} />
            <Route path="/tramites" element={<TramitesPage />} />
            <Route path="/docente/comisiones/:comisionId" element={<DocenteComisionPage />} />
            <Route path="/docente/mesas" element={<DocenteMesasPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
