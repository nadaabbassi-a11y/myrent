import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Upload de l'image
    let imageUrl: string;
    const filename = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;

    // En production, utiliser Vercel Blob
    if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        return NextResponse.json(
          { error: "Configuration du stockage manquante" },
          { status: 500 }
        );
      }

      const { put } = await import("@vercel/blob");
      const blob = await put(`profile-images/${filename}`, file, {
        access: "public",
        contentType: file.type,
        token,
      });
      imageUrl = blob.url;
    } else {
      // En développement, stocker localement
      const publicDir = join(process.cwd(), "public", "profile-images");
      await mkdir(publicDir, { recursive: true });
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = join(publicDir, filename);
      await writeFile(filePath, buffer);
      
      imageUrl = `/profile-images/${filename}`;
    }

    // Supprimer l'ancienne image si elle existe
    if (user.image) {
      try {
        // Si c'est une URL Vercel Blob, on peut essayer de la supprimer
        // Note: Vercel Blob ne fournit pas d'API de suppression gratuite
        // On laisse l'ancienne image pour l'instant
      } catch (error) {
        console.error("Erreur lors de la suppression de l'ancienne image:", error);
      }
    }

    // Mettre à jour l'utilisateur avec la nouvelle URL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[Profile Image Upload] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Mettre à jour l'utilisateur pour supprimer l'image
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Profile Image Delete] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    );
  }
}

