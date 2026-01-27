import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { Role } from './types'

// Centralized JWT secret access - throws error if missing
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required. Please set it in your .env file.'
    )
  }
  return secret
}

export interface TokenPayload {
  userId: string
  email: string
  role: 'TENANT' | 'LANDLORD'
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export async function getSessionUser(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return null
    }

    // Vérifier que l'utilisateur existe toujours avec un timeout
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          image: true,
        },
      }),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 5000) // 5 secondes timeout
      }),
    ])

    return user
  } catch (error) {
    console.error('Erreur dans getSessionUser:', error)
    return null
  }
}

/**
 * RBAC Helper: Require authentication
 * Returns user or throws error that should be caught and converted to 401 response
 */
export async function requireAuth(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    const error = new Error('UNAUTHORIZED') as Error & { statusCode: number }
    error.statusCode = 401
    throw error
  }
  return user
}

/**
 * RBAC Helper: Require specific role
 * Returns user or throws error that should be caught and converted to 403 response
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: 'TENANT' | 'LANDLORD'
): Promise<{ id: string; email: string; name: string | null; role: string; image: string | null }> {
  const user = await requireAuth(request)
  if (user.role !== requiredRole) {
    const error = new Error('FORBIDDEN') as Error & { statusCode: number }
    error.statusCode = 403
    throw error
  }
  return user
}


