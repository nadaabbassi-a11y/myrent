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
  budgetMax: z.number().positive().optional().nullable(),
  monthlyIncomeRange: z.string().optional().nullable(),
  incomeConsent: z.boolean().optional(),
})

// GET - Récupérer le profil
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT)

    const tenantProfile = await prisma.tenantProfile.findUnique({
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

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile: {
        ...tenantProfile,
        user: tenantProfile.user,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le profil
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT)

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Mettre à jour l'utilisateur si le nom est fourni et non vide
    if (validatedData.name !== undefined && validatedData.name !== '') {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: validatedData.name },
      })
    }

    // Mettre à jour le profil tenant
    const tenantProfile = await prisma.tenantProfile.update({
      where: { userId: user.id },
      data: {
        phone: validatedData.phone,
        budgetMax: validatedData.budgetMax,
        monthlyIncomeRange: validatedData.monthlyIncomeRange,
        incomeConsent: validatedData.incomeConsent,
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

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      profile: {
        ...tenantProfile,
        user: tenantProfile.user,
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


