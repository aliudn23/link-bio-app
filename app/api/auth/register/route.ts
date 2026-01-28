import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../api/utils/prisma';
import { hashPassword } from '../../../../api/utils/password';
import { generateToken } from '../../../../api/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    }, { status: 201 });

    // Set HTTP-only cookie for middleware authentication
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true, // Always true since Vercel uses HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}