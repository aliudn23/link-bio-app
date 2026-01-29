import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../api/utils/prisma';

// GET public profile by user ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        darkMode: true,
        themeColor: true,
        email: false,
        password: false,
        createdAt: true,
        links: {
          where: { active: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            url: true,
            order: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Public profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
