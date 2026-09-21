/**
 * Stockage fichiers publics
 * Dev : /public/...
 * Prod (Vercel) : Vercel Blob Storage
 */

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

export function isBlobStorageEnabled(): boolean {
  return !!(process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN);
}

/** Chemin relatif sous public/ en local, clé blob en prod (ex. listings/abc.jpg) */
export async function storePublicFile(
  data: Buffer | File,
  storagePath: string,
  contentType: string
): Promise<string> {
  if (isBlobStorageEnabled()) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        'BLOB_READ_WRITE_TOKEN est requis en production. Configurez-le dans Vercel → Storage → Blob.'
      );
    }

    const { put } = await import('@vercel/blob');
    const body: File | Buffer = data instanceof File ? data : data;

    const blob = await put(storagePath, body, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
  }

  const localPath = storagePath.startsWith('public/')
    ? storagePath.slice('public/'.length)
    : storagePath;
  const publicDir = join(process.cwd(), 'public', dirname(localPath));
  await mkdir(publicDir, { recursive: true });

  const filePath = join(process.cwd(), 'public', localPath);
  const buffer =
    data instanceof File ? Buffer.from(await data.arrayBuffer()) : data;
  await writeFile(filePath, buffer);

  return `/${localPath.replace(/\\/g, '/')}`;
}

export async function storePDF(
  buffer: Buffer,
  filename: string,
  contentType = 'application/pdf'
): Promise<string> {
  return storePublicFile(buffer, `leases/${filename}`, contentType);
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

