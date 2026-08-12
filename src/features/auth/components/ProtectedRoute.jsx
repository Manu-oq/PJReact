import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useUser } from "../../../components/context/UserContext";

export const ProtectedRoute = ({ children, allowedRoles = [], allowedPermissions = [] }) => {
  const { hasAnyRole, hasAnyPermission } = useUser();

  // Este control solo protege navegación y UI; el backend sigue siendo la autoridad de permisos.
  const roleAllowed = allowedRoles.length === 0 || hasAnyRole(allowedRoles);
  const permissionAllowed = allowedPermissions.length === 0 || hasAnyPermission(allowedPermissions);

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  allowedPermissions: PropTypes.arrayOf(PropTypes.string),
};
