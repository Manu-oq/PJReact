import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { Header } from "./components/partials/header/Header";
import { Footer } from "./components/partials/footer/Footer";
import { UserProvider } from "./components/context/UserContext";
import "./app.css";
import Logout from "./components/Logout";
import { PageLoader } from "./components/feedback/PageState";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { useCertificacionesAccess } from "./features/certificaciones/hooks/useCertificacionesAccess";
import {
  CERTIFICACIONES_CASES_ROUTE,
  CERTIFICACIONES_NAV_LINK,
  CERTIFICACIONES_PERMISSION,
  CERTIFICACIONES_ROUTE,
} from "./features/certificaciones/utils/constants";
import { useComisionAccess } from "./features/comision/hooks/useComisionAccess";
import { COMISION_ALLOWED_ROLES, COMISION_HISTORY_PERMISSION } from "./features/comision/utils/constants";

const Home = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const FrequentQuestions = lazy(() => import("./pages/FrequentQuestions").then((module) => ({ default: module.FrequentQuestions })));
const GeneralInformation = lazy(() => import("./pages/GeneralInformation").then((module) => ({ default: module.GeneralInformation })));
const OpeningOfFilesAndOathOfLawyers = lazy(() => import("./pages/Opening_of_files_and_oath_of_lawyers"));
const ComisionLibertadPage = lazy(() => import("./pages/Comision/ComisionLibertadPage"));
const VotacionPage = lazy(() => import("./pages/Comision/VotacionPage"));
const AdminVotacionPage = lazy(() => import("./pages/Comision/AdminVotacionPage"));
const HistoricoCiclosPage = lazy(() => import("./pages/Comision/HistoricoCiclosPage"));
const HistoricoPostulantesPage = lazy(() => import("./pages/Comision/HistoricoPostulantesPage"));
const CertificacionesPage = lazy(() => import("./pages/CertificacionesPage"));
const CertificacionesCasesPage = lazy(() => import("./pages/CertificacionesCasesPage"));

const AppContent = () => {
  const { puedeVerModulo } = useComisionAccess();
  const { puedeVerModulo: puedeVerCertificaciones } = useCertificacionesAccess();
  const navLinks = useMemo(
    () => [
      { title: "Inicio", path: "/" },
      { title: "Preguntas Frecuentes", path: "/preguntas-frecuentes" },
      { title: "Información general", path: "/general-information" },
      {
        title: "Noticias regionales",
        path: "https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial",
        isExternal: true,
      },
      ...(puedeVerCertificaciones ? [CERTIFICACIONES_NAV_LINK] : []),
      ...(puedeVerModulo ? [{ title: "Comisión Libertad", path: "/comision-libertad-condicional" }] : []),
      { title: "Cerrar sesión", path: "/logout", requiresAuth: true },
    ],
    [puedeVerCertificaciones, puedeVerModulo]
  );

  return (
    <>
      <Header navLinks={navLinks} />
      <div className="app-container">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/Apertura-juramentos" element={<OpeningOfFilesAndOathOfLawyers />} />
            <Route path="/preguntas-frecuentes" element={<FrequentQuestions />} />
            <Route path="/general-information" element={<GeneralInformation />} />
            <Route
              path={CERTIFICACIONES_CASES_ROUTE}
              element={
                <ProtectedRoute allowedPermissions={[CERTIFICACIONES_PERMISSION]}>
                  <CertificacionesCasesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={CERTIFICACIONES_ROUTE}
              element={
                <ProtectedRoute allowedPermissions={[CERTIFICACIONES_PERMISSION]}>
                  <CertificacionesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comision-libertad-condicional"
              element={
                <ProtectedRoute allowedRoles={COMISION_ALLOWED_ROLES}>
                  <ComisionLibertadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comision-libertad-condicional/unidad/:unidadId"
              element={
                <ProtectedRoute allowedRoles={COMISION_ALLOWED_ROLES}>
                  <VotacionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/votaciones/:unidadId"
              element={
                <ProtectedRoute allowedRoles={COMISION_ALLOWED_ROLES}>
                  <AdminVotacionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/votaciones/:unidadId/historico"
              element={
                <ProtectedRoute allowedRoles={COMISION_ALLOWED_ROLES} allowedPermissions={[COMISION_HISTORY_PERMISSION]}>
                  <HistoricoCiclosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/votaciones/:unidadId/historico/:cicloId"
              element={
                <ProtectedRoute allowedRoles={COMISION_ALLOWED_ROLES} allowedPermissions={[COMISION_HISTORY_PERMISSION]}>
                  <HistoricoPostulantesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
};

export const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};
