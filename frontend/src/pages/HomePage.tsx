import { useAuth } from "../auth/AuthContext";
import { DashboardPage } from "./DashboardPage";
import { DocenteDashboardPage } from "./docente/DocenteDashboardPage";
import { AdminDashboardPage } from "./AdminDashboardPage";

export function HomePage() {
  const { usuario } = useAuth();

  if (usuario?.rol === "docente") return <DocenteDashboardPage />;
  if (usuario?.rol === "administrativo") return <AdminDashboardPage />;
  return <DashboardPage />;
}
