import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../api/utils/prisma';
import { authMiddleware, AuthenticatedRequest } from '../../../../api/middleware/auth';

async function getProfile(req: AuthenticatedRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        links: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateProfile(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { name, bio, avatar, darkMode, themeColor } = body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(darkMode !== undefined && { darkMode }),
        ...(themeColor !== undefined && { themeColor })
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getProfile);
export const PATCH = authMiddleware(updateProfile);