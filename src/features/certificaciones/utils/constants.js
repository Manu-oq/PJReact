import { AUTH_PERMISSIONS } from "../../auth/constants/authorization";

export const CERTIFICACIONES_PERMISSION = AUTH_PERMISSIONS.GESTIONAR_CERTIFICACIONES;
export const CERTIFICACIONES_ROUTE = "/certificaciones";
export const CERTIFICACIONES_NAV_LINK = Object.freeze({
  title: "Certificaciones",
  path: CERTIFICACIONES_ROUTE,
  requiresAuth: true,
});
