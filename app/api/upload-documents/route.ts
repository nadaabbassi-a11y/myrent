import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Autoriser PDF + images courantes
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF ou une image (PNG, JPG)' },
        { status: 400 }
      );
    }

    // Taille max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const fileName = `${timestamp}-${randomString}-${safeOriginalName}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/documents/${fileName}`;

    return NextResponse.json(
      {
        message: 'Fichier uploadé avec succès',
        url: fileUrl,
        originalName: file.name,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur lors de l'upload de document:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'upload du document" },
      { status: 500 }
    );
  }
}
