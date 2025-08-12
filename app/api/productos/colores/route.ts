import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getUserToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No autorizado');
  return await getTokenData(token);
}

export async function GET() {
  try {
    const user = await getUserToken();

    const variantes = await prisma.varianteProducto.findMany({
      where: { 
        color: { not: null },
        tenantId: user.tenantId
      },
      select: { color: true },
      distinct: ['color'],
    });

    const colores = Array.from(
      new Set(
        variantes
          .map((v: { color: string | null }) => v.color?.trim().toLowerCase())
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({ data: colores });
  } catch (error) {
    console.error('Error al cargar colores:', error);
    return NextResponse.json({ error: 'Error al cargar colores' }, { status: 500 });
  }
}