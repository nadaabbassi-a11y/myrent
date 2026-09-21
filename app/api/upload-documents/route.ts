import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { storePublicFile } from '@/lib/storage';

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

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF ou une image (PNG, JPG)' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const fileName = `${timestamp}-${randomString}-${safeOriginalName}`;
    const storagePath = `documents/${fileName}`;

    const fileUrl = await storePublicFile(file, storagePath, file.type);

    return NextResponse.json(
      {
        message: 'Fichier uploadé avec succès',
        url: fileUrl,
        originalName: file.name,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'upload de document:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'upload du document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
