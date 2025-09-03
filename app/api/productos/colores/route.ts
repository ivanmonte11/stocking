import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/getUserFromCookies';


const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await getUserFromCookies();

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
          .map((v: { color: string | null }) => v.color?.trim())
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({ data: colores });
  } catch (error) {
    console.error('Error al cargar colores:', error);
    return NextResponse.json({ error: 'Error al cargar colores' }, { status: 500 });
  }
}
