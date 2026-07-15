import type { Access, FieldAccess } from "payload";

export type Role = "superadmin" | "editor" | "contributor";

const hasRole = (user: unknown, roles: Role[]): boolean => {
  const u = user as { role?: Role } | null | undefined;
  return Boolean(u?.role && roles.includes(u.role));
};

/** Anyone, including unauthenticated visitors. */
export const anyone: Access = () => true;

/** Any logged-in admin-panel user. */
export const anyStaff: Access = ({ req }) =>
  hasRole(req.user, ["superadmin", "editor", "contributor"]);

/** Editors and super admins. */
export const editors: Access = ({ req }) =>
  hasRole(req.user, ["superadmin", "editor"]);

/** Super admins only. */
export const superAdmins: Access = ({ req }) => hasRole(req.user, ["superadmin"]);

export const superAdminsField: FieldAccess = ({ req }) =>
  hasRole(req.user, ["superadmin"]);

/**
 * Public read for published docs; staff see everything (incl. drafts).
 * Use on collections with versions/drafts enabled.
 */
export const publishedOrStaff: Access = ({ req }) => {
  if (hasRole(req.user, ["superadmin", "editor", "contributor"])) return true;
  return { _status: { equals: "published" } };
};

/** Public read for docs flagged active; staff see everything. */
export const activeOrStaff: Access = ({ req }) => {
  if (hasRole(req.user, ["superadmin", "editor", "contributor"])) return true;
  return { active: { equals: true } };
};
