import { NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = getTokenData(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        status: true,
        accesoHasta: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error en /api/session:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
