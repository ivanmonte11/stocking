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
        talla: { not: null },
        tenantId: user.tenantId
      },
      select: { talla: true },
      distinct: ['talla'],
    });

    const tallas = Array.from(
      new Set(
        variantes
          .map((v: { talla: string | null }) => v.talla?.trim().toLowerCase())
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({ data: tallas });
  } catch (error) {
    console.error('Error al cargar tallas:', error);
    return NextResponse.json({ error: 'Error al cargar tallas' }, { status: 500 });
  }
}