import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../api/utils/prisma';
import { verifyToken } from '../../../../api/utils/jwt';

// POST reorder links
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

    const { links } = await req.json();

    if (!Array.isArray(links)) {
      return NextResponse.json(
        { error: 'Invalid links data' },
        { status: 400 }
      );
    }

    // Update all links in a transaction
    await prisma.$transaction(
      links.map((link: { id: string; order: number }) =>
        prisma.link.updateMany({
          where: {
            id: link.id,
            userId: decoded.id // Ensure user owns the link
          },
          data: { order: link.order }
        })
      )
    );

    return NextResponse.json({ message: 'Links reordered successfully' });
  } catch (error) {
    console.error('Reorder links error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder links' },
      { status: 500 }
    );
  }
}
