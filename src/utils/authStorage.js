const AUTH_STORAGE_KEY = "auth_session";

const emptySession = {
  token: null,
  name: "",
  email: "",
  roles: [],
  permissions: [],
};

export const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return emptySession;
    }

    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || null,
      name: parsed.name || "",
      email: parsed.email || "",
      roles: Array.isArray(parsed.roles) ? parsed.roles : [],
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
    };
  } catch {
    return emptySession;
  }
};

export const persistSession = ({ token = null, name = "", email = "", roles = [], permissions = [] }) => {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token,
      name,
      email,
      roles,
      permissions,
    })
  );
};

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("roles");
  localStorage.removeItem("permissions");
};

export const migrateLegacySession = () => {
  const legacyToken = localStorage.getItem("token");
  const legacyName = localStorage.getItem("name");
  const legacyEmail = localStorage.getItem("email");
  const legacyRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  const legacyPermissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  if (!legacyToken && !legacyName && !legacyEmail && legacyRoles.length === 0 && legacyPermissions.length === 0) {
    return getStoredSession();
  }

  const migratedSession = {
    token: legacyToken || null,
    name: legacyName || "",
    email: legacyEmail || "",
    roles: Array.isArray(legacyRoles) ? legacyRoles : [],
    permissions: Array.isArray(legacyPermissions) ? legacyPermissions : [],
  };

  clearStoredSession();
  persistSession(migratedSession);

  return migratedSession;
};
