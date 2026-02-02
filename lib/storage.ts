/**
 * Storage utility for PDF files
 * In development: stores in /public/leases
 * In production: uses Vercel Blob Storage
 */

// Dynamic import for Vercel Blob (only in production)
// import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function storePDF(
  buffer: Buffer,
  filename: string,
  contentType = 'application/pdf'
): Promise<string> {
  // In production, use Vercel Blob
  if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required for production');
    }

    // Dynamic import to avoid errors in dev
    const { put } = await import('@vercel/blob');
    
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
  }

  // In development, store locally
  const publicDir = join(process.cwd(), 'public', 'leases');
  await mkdir(publicDir, { recursive: true });
  
  const filePath = join(publicDir, filename);
  await writeFile(filePath, buffer);
  
  return `/leases/${filename}`;
}

export async function getPDF(url: string): Promise<Buffer> {
  // If it's a Vercel Blob URL, fetch it
  if (url.startsWith('https://') && url.includes('blob.vercel-storage.com')) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from blob storage: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // If it's a local path, read from filesystem
  if (url.startsWith('/')) {
    const { readFile } = await import('fs/promises');
    const filePath = join(process.cwd(), 'public', url);
    return readFile(filePath);
  }

  throw new Error(`Unsupported PDF URL format: ${url}`);
}

