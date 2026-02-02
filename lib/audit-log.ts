import { prisma } from './prisma';

export type AuditAction =
  | 'LEASE_TENANT_SIGNED'
  | 'LEASE_OWNER_SIGNED'
  | 'LEASE_FINALIZED'
  | 'PDF_GENERATED'
  | 'PDF_DOWNLOADED'
  | 'PDF_VIEWED'
  | 'ANNEX_SIGNED'
  | 'ANNEX_CREATED';

interface AuditLogMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
  documentVersion?: number;
  documentHash?: string;
  [key: string]: any;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  action: AuditAction,
  entity: 'LEASE' | 'ANNEX',
  options: {
    userId?: string;
    leaseId?: string;
    annexId?: string;
    entityId?: string;
    metadata?: AuditLogMetadata;
  }
) {
  return prisma.auditLog.create({
    data: {
      action,
      entity,
      userId: options.userId,
      leaseId: options.leaseId,
      annexId: options.annexId,
      entityId: options.entityId,
      metadata: options.metadata || {},
    },
  });
}


