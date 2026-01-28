import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const token = req.cookies.get('token')?.value;
  
  return NextResponse.json({
    message: 'Cookie test endpoint',
    hasCookie: !!token,
    tokenLength: token?.length || 0,
    allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    headers: {
      cookie: req.headers.get('cookie'),
      authorization: req.headers.get('authorization')
    }
  });
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Test cookie set' });
  
  response.cookies.set('test-token', 'test-value-123', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/'
  });
  
  return response;
}
