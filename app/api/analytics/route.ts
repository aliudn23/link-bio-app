import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../api/utils/prisma';
import { verifyToken } from '../../../api/utils/jwt';

// GET analytics for user's links
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');

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

    // Get links with click counts
    const links = await prisma.link.findMany({
      where: { userId: decoded.id },
      select: {
        id: true,
        title: true,
        url: true,
        clicks: true,
        active: true,
        _count: {
          select: { clickEvents: true }
        }
      },
      orderBy: { clicks: 'desc' }
    });

    // Get total clicks
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

    // Get recent click events
    const recentClicks = await prisma.clickEvent.findMany({
      where: {
        link: {
          userId: decoded.id
        }
      },
      include: {
        link: {
          select: {
            title: true,
            url: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    return NextResponse.json({
      totalClicks,
      links,
      recentClicks
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
