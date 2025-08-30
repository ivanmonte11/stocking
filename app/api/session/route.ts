import { NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;

    //  Validación editorial del token
    if (!token || token.trim() === '') {
      console.warn('Token ausente o vacío');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    let decoded;
    try {
      decoded = getTokenData(token);
      if (!decoded?.id) throw new Error('Token inválido o sin ID');
    } catch (err) {
      console.warn('Error al decodificar token:', err);
      return NextResponse.json({ user: null }, { status: 401 });
    }

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
      console.warn('Usuario no encontrado en base de datos');
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error inesperado en /api/session:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
