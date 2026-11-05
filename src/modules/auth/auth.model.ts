export const userRoles = ["OWNER", "ADMIN", "DENTIST", "RECEPTION"] as const;
export type UserRole = (typeof userRoles)[number];
