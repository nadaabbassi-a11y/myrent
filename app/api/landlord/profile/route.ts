import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/types'

const updateProfileSchema = z.object({
  name: z.string().refine((val) => val === '' || val.length >= 2, {
    message: 'Le nom doit contenir au moins 2 caractères',
  }).optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
})

// GET - Récupérer le profil
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD)

    let landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Si le profil n'existe pas, le créer
    if (!landlordProfile) {
      landlordProfile = await prisma.landlordProfile.create({
        data: {
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      })
    }

    return NextResponse.json({
      profile: {
        ...landlordProfile,
        user: landlordProfile.user,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le profil
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD)

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Mettre à jour l'utilisateur si le nom est fourni et non vide
    if (validatedData.name !== undefined && validatedData.name !== '') {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: validatedData.name },
      })
    }

    // Vérifier si le profil existe, sinon le créer
    let landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    })

    if (!landlordProfile) {
      // Créer le profil avec les données
      landlordProfile = await prisma.landlordProfile.create({
        data: {
          userId: user.id,
          phone: validatedData.phone,
          company: validatedData.company,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      })
    } else {
      // Mettre à jour le profil landlord
      landlordProfile = await prisma.landlordProfile.update({
        where: { userId: user.id },
        data: {
          phone: validatedData.phone,
          company: validatedData.company,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      })
    }

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      profile: {
        ...landlordProfile,
        user: landlordProfile.user,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

