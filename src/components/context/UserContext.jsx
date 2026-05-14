import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { clearStoredSession, getStoredSession, migrateLegacySession, persistSession } from "../../utils/authStorage";

const UserContext = createContext(null);

const getInitialSession = () => {
  const stored = getStoredSession();

  if (stored.token || stored.name || stored.email || stored.roles.length || stored.permissions.length) {
    return stored;
  }

  return migrateLegacySession();
};

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(getInitialSession);

  const login = useCallback((token, user) => {
    const nextSession = {
      token: token || null,
      name: user?.name || "",
      email: user?.email || "",
      roles: Array.isArray(user?.roles) ? user.roles : [],
      permissions: Array.isArray(user?.permissions) ? user.permissions : [],
    };

    persistSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession({ token: null, name: "", email: "", roles: [], permissions: [] });
  }, []);

  const value = useMemo(() => {
    const roles = session.roles || [];
    const permissions = session.permissions || [];

    return {
      isAuthenticated: Boolean(session.token),
      userName: session.name || "",
      userEmail: session.email || "",
      roles,
      permissions,
      token: session.token,
      login,
      logout,
      hasRole: (role) => roles.includes(role),
      hasAnyRole: (allowedRoles = []) => allowedRoles.some((role) => roles.includes(role)),
      hasPermission: (permission) => permissions.includes(permission),
      hasAnyPermission: (allowedPermissions = []) => allowedPermissions.some((permission) => permissions.includes(permission)),
    };
  }, [login, logout, session]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe usarse dentro de UserProvider");
  }

  return context;
};
