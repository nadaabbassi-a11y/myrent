import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis pour confirmer la suppression'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = deleteAccountSchema.parse(body);

    // Récupérer l'utilisateur complet avec le hash du mot de passe pour vérification
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(validatedData.password, fullUser.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Supprimer l'utilisateur (les profils et données associées seront supprimés en cascade grâce aux relations Prisma)
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Créer une réponse avec suppression du cookie de session
    const response = NextResponse.json(
      { message: 'Compte supprimé avec succès' },
      { status: 200 }
    );

    // Supprimer le cookie de session
    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du compte' },
      { status: 500 }
    );
  }
}

