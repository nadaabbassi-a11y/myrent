import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
// Utiliser SendGrid si disponible, sinon Resend
import { sendWelcomeEmail as sendWelcomeEmailSendGrid } from '@/lib/email-sendgrid'
import { sendWelcomeEmail as sendWelcomeEmailResend } from '@/lib/email'

// Choisir le service d'email selon la configuration
const sendWelcomeEmail = process.env.SENDGRID_API_KEY 
  ? sendWelcomeEmailSendGrid 
  : sendWelcomeEmailResend

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['TENANT', 'LANDLORD']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Données reçues pour inscription:', { ...body, password: '***' });
    
    // Validation avec Zod
    const validatedData = signUpSchema.parse(body)
    console.log('Données validées:', { ...validatedData, password: '***' });

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash: passwordHash,
        role: validatedData.role,
      },
    })

    // Créer le profil correspondant (TenantProfile ou LandlordProfile)
    if (validatedData.role === 'TENANT') {
      await prisma.tenantProfile.create({
        data: {
          userId: user.id,
        },
      })
    } else {
      await prisma.landlordProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    // Envoyer l'email de bienvenue (en arrière-plan, ne pas bloquer la réponse)
    // Ne pas attendre la réponse pour ne pas bloquer l'inscription
    sendWelcomeEmail({
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
    }).then((result) => {
      if (result.success) {
        console.log('✅ Email de bienvenue envoyé avec succès:', result.id);
      } else {
        console.error('❌ Échec de l\'envoi de l\'email:', result.error);
      }
    }).catch((error) => {
      // Log l'erreur mais ne pas faire échouer l'inscription
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    });

    // Retourner la réponse sans le hash du mot de passe
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'Compte créé avec succès',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}


