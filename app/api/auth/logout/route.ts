import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    message: 'Logout successful'
  });

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true, // Always true since Vercel uses HTTPS
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}
