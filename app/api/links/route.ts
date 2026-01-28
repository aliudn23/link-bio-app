import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../api/utils/prisma';
import { verifyToken } from '../../../api/utils/jwt';

// GET all links for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const links = await prisma.link.findMany({
      where: { userId: decoded.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Get links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST create a new link
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { title, url } = await req.json();

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Get the highest order value for this user
    const maxOrderLink = await prisma.link.findFirst({
      where: { userId: decoded.id },
      orderBy: { order: 'desc' }
    });

    const newOrder = maxOrderLink ? maxOrderLink.order + 1 : 0;

    const link = await prisma.link.create({
      data: {
        title,
        url,
        userId: decoded.id,
        order: newOrder
      }
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
