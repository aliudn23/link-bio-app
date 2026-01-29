import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../api/utils/prisma';

// Configure route segment  
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// POST track link click
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userAgent = req.headers.get('user-agent') || undefined;
    const referer = req.headers.get('referer') || undefined;

    // Increment click count and create click event
    await prisma.$transaction([
      prisma.link.update({
        where: { id },
        data: { clicks: { increment: 1 } }
      }),
      prisma.clickEvent.create({
        data: {
          linkId: id,
          userAgent,
          referer
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
