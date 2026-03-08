import { Route, Routes, Navigate } from "react-router-dom";
import { Header } from "./components/partials/header/Header";
import { UserProvider, useUser } from "./components/context/UserContext";
import Home from "./pages/Home";
import { Footer } from "./components/partials/footer/Footer";
import "./app.css";
// import CourtRoomPage from "./pages/CourtRoomPage";
// import RoomPage from "./pages/RoomPage";
import { FrequentQuestions } from "./pages/FrequentQuestions";
import { lazy, Suspense } from "react";
import Logout from "./components/Logout";
import { GeneralInformation } from "./pages/GeneralInformation";
import Opening_of_files_and_oath_of_lawyers from "./pages/Opening_of_files_and_oath_of_lawyers";
import PropTypes from "prop-types";
import ComisionLibertadPage from "./pages/Comision/ComisionLibertadPage"; 
import VotacionPage from "./pages/Comision/VotacionPage"; 

const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminVotacionPage = lazy(() => import("./pages/Comision/AdminVotacionPage"));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const hasPermission = roles.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const AppContent = () => {
  const { isAuthenticated } = useUser();
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const puedeVerModulo = roles.some(r => ['juez', 'archivero', 'ingeniero'].includes(r));
  

  const navLinks = [
    { title: "Inicio", path: "/" },
    { title: "Preguntas Frecuentes", path: "/preguntas-frecuentes" },
    { title: "Información general", path: "/general-information" },
    {
      title: "Noticias regionales",
      path: "https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial",
      isExternal: true,
    },
    ...(puedeVerModulo ?  [{ title: "Comisión Libertad", path: "/comision-libertad-condicional" }] : []), 
    ...(isAuthenticated ? [{ title: "Cerrar sesión", path: "/logout" }] : []),
  ];

  return (
    <>
      <Header navLinks={navLinks} />
      <div className="app-container">
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            {/* <Route path="/sala-de-audiencias" element={<CourtRoomPage />} /> */}
            <Route path="/Apertura-juramentos" element={<Opening_of_files_and_oath_of_lawyers />} />
            {/* <Route path="/sala-de-audiencias/:id" element={<RoomPage />} /> */}
            <Route path="/preguntas-frecuentes" element={<FrequentQuestions />} />
            <Route path="/general-information" element={<GeneralInformation />} />
            <Route
              path="/comision-libertad-condicional"
              element={
                <ProtectedRoute allowedRoles={['juez', 'archivero', 'ingeniero']}> 
                  <ComisionLibertadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comision-libertad-condicional/unidad/:unidadId"
              element={
                <ProtectedRoute allowedRoles={['juez', 'archivero', 'ingeniero']}> 
                  <VotacionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/votaciones/:unidadId"
              element={
                <ProtectedRoute allowedRoles={['juez', 'archivero', 'ingeniero']}> 
                  <AdminVotacionPage />
                </ProtectedRoute>
              }
            />

            <Route path="/logout" element={<Logout />} />
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