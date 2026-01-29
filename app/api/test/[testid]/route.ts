import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ testid: string }> }
) {
  const { testid } = await params;
  return NextResponse.json({ 
    message: 'Dynamic route works!',
    testid,
    timestamp: new Date().toISOString()
  });
}
