import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutAPI } from "../Services/AuthService";
import { useUser } from "./context/UserContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logoutAPI();
      } catch {
        // Si la sesión backend ya expiró, igual limpiamos el estado local.
      } finally {
        logout();
        navigate("/", { replace: true });
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return null;
};

export default Logout;
