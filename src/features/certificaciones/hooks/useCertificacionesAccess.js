import { useMemo } from "react";
import { useUser } from "../../../components/context/UserContext";
import { CERTIFICACIONES_PERMISSION } from "../utils/constants";

export const useCertificacionesAccess = () => {
  const { hasPermission, isAuthenticated } = useUser();

  return useMemo(
    () => ({
      puedeVerModulo: isAuthenticated && hasPermission(CERTIFICACIONES_PERMISSION),
    }),
    [hasPermission, isAuthenticated]
  );
};
