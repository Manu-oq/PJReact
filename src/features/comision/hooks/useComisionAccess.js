import { useMemo } from "react";
import { useUser } from "../../../components/context/UserContext";
import { AUTH_ROLES } from "../../auth/constants/authorization";
import { COMISION_ADMIN_ROLES, COMISION_ALLOWED_ROLES, COMISION_HISTORY_PERMISSION, COMISION_VOTE_PERMISSIONS } from "../utils/constants";

export const useComisionAccess = () => {
  const { hasAnyPermission, hasAnyRole, hasRole, hasPermission } = useUser();

  return useMemo(
    () => ({
      puedeVerModulo: hasAnyRole(COMISION_ALLOWED_ROLES),
      puedeVotar: hasAnyPermission(COMISION_VOTE_PERMISSIONS),
      mostrarAdmin: hasAnyRole(COMISION_ADMIN_ROLES),
      puedeGestionarHistorico: hasPermission(COMISION_HISTORY_PERMISSION),
      esIngeniero: hasRole(AUTH_ROLES.INGENIERO),
    }),
    [hasAnyPermission, hasAnyRole, hasPermission, hasRole]
  );
};
