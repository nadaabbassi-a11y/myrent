import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation avec Zod
    const validatedData = signInSchema.parse(body)

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    if (!user.passwordHash) {
      console.error('User found but passwordHash is missing:', user.email)
      return NextResponse.json(
        { error: 'Erreur de configuration du compte. Veuillez contacter le support.' },
        { status: 500 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer le token JWT
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'TENANT' | 'LANDLORD',
    })

    // Retourner la réponse avec le cookie HTTP-only
    const response = NextResponse.json(
      {
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        },
      },
      { status: 200 }
    )

    // Définir le cookie HTTP-only
    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}


