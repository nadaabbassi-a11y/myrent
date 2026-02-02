import crypto from 'crypto';

/**
 * Generate SHA-256 hash of document content
 * Used for document integrity verification
 */
export function generateDocumentHash(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate unique document ID for a lease
 * Format: LEASE-{timestamp}-{random}
 */
export function generateDocumentId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LEASE-${timestamp}-${random}`;
}


