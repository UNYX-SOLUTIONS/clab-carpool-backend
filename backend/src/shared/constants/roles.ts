export const UserRoles = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
