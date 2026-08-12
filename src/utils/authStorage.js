const AUTH_STORAGE_KEY = "auth_session";
const LEGACY_AUTH_KEYS = ["token", "name", "email", "roles", "permissions"];

const createMemoryStorage = () => {
  const store = new Map();

  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
};

const memoryStorage = createMemoryStorage();

const emptySession = {
  token: null,
  name: "",
  email: "",
  roles: [],
  permissions: [],
};

const isStorageAvailable = (storageName) => {
  try {
    const storage = globalThis?.[storageName];

    if (!storage) {
      return false;
    }

    const probeKey = "__auth_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);

    return true;
  } catch {
    return false;
  }
};

// Mitigacion transitoria: evitar localStorage mientras el backend siga dependiendo de bearer token.
const getSessionStorage = () => (isStorageAvailable("sessionStorage") ? globalThis.sessionStorage : memoryStorage);
const getLegacyLocalStorage = () => (isStorageAvailable("localStorage") ? globalThis.localStorage : null);

const normalizeSession = (parsed = {}) => ({
  token: parsed.token || null,
  name: parsed.name || "",
  email: parsed.email || "",
  roles: Array.isArray(parsed.roles) ? parsed.roles : [],
  permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
});

const readStoredSession = (storage) => {
  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return emptySession;
    }

    return normalizeSession(JSON.parse(raw));
  } catch {
    return emptySession;
  }
};

export const getStoredSession = () => {
  return readStoredSession(getSessionStorage());
};

export const persistSession = ({ token = null, name = "", email = "", roles = [], permissions = [] }) => {
  getSessionStorage().setItem(
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
  getSessionStorage().removeItem(AUTH_STORAGE_KEY);

  const legacyLocalStorage = getLegacyLocalStorage();
  if (!legacyLocalStorage) {
    return;
  }

  legacyLocalStorage.removeItem(AUTH_STORAGE_KEY);
  LEGACY_AUTH_KEYS.forEach((key) => legacyLocalStorage.removeItem(key));
};

export const migrateLegacySession = () => {
  const legacyLocalStorage = getLegacyLocalStorage();

  if (!legacyLocalStorage) {
    return getStoredSession();
  }

  const legacyCompositeSession = readStoredSession(legacyLocalStorage);

  if (
    legacyCompositeSession.token ||
    legacyCompositeSession.name ||
    legacyCompositeSession.email ||
    legacyCompositeSession.roles.length > 0 ||
    legacyCompositeSession.permissions.length > 0
  ) {
    clearStoredSession();
    persistSession(legacyCompositeSession);
    return legacyCompositeSession;
  }

  const legacyToken = legacyLocalStorage.getItem("token");
  const legacyName = legacyLocalStorage.getItem("name");
  const legacyEmail = legacyLocalStorage.getItem("email");
  const legacyRoles = JSON.parse(legacyLocalStorage.getItem("roles") || "[]");
  const legacyPermissions = JSON.parse(legacyLocalStorage.getItem("permissions") || "[]");

  if (!legacyToken && !legacyName && !legacyEmail && legacyRoles.length === 0 && legacyPermissions.length === 0) {
    return getStoredSession();
  }

  const migratedSession = normalizeSession({
    token: legacyToken,
    name: legacyName,
    email: legacyEmail,
    roles: legacyRoles,
    permissions: legacyPermissions,
  });

  clearStoredSession();
  persistSession(migratedSession);

  return migratedSession;
};
