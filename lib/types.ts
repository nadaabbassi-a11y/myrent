/**
 * Role type definition
 * Note: SQLite doesn't support Prisma enums, so we use a string type
 * with application-level validation
 */
export type Role = 'TENANT' | 'LANDLORD'

export const Role = {
  TENANT: 'TENANT' as const,
  LANDLORD: 'LANDLORD' as const,
} as const


