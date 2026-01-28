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
    // Vérifier que JWT_SECRET est configuré
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in environment variables')
      return NextResponse.json(
        { error: 'Erreur de configuration serveur' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // Validation avec Zod
    const validatedData = signInSchema.parse(body)

    // Trouver l'utilisateur par email avec timeout
    let user
    try {
      user = await Promise.race([
        prisma.user.findUnique({
          where: { email: validatedData.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            passwordHash: true,
          },
        }),
        new Promise<null>((resolve) => {
          setTimeout(() => {
            console.error('Timeout lors de la recherche de l\'utilisateur')
            resolve(null)
          }, 10000) // 10 secondes timeout
        }),
      ])
    } catch (dbError) {
      console.error('Erreur de base de données lors de la connexion:', dbError)
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données' },
        { status: 500 }
      )
    }

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
    // En production sur Vercel, secure doit être true (HTTPS requis)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
      // Ajouter domain si nécessaire pour Vercel
      ...(isProduction && { domain: undefined }), // Vercel gère le domain automatiquement
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
    
    // Log plus détaillé pour le debugging
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message)
      console.error('Stack trace:', error.stack)
    }

    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la connexion',
        // En développement, inclure plus de détails
        ...(process.env.NODE_ENV === 'development' && error instanceof Error ? { details: error.message } : {})
      },
      { status: 500 }
    )
  }
}


