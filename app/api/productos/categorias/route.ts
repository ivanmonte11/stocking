import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await getUserFromCookies();

    const categorias = await prisma.producto.findMany({
      where: { 
        categoria: { not: null },
        tenantId: user.tenantId
      },
      select: { categoria: true },
      distinct: ['categoria'],
    });

    const valores = Array.from(
      new Set(
        categorias
          .map((c) => c.categoria?.trim())
          .filter(Boolean)
      )
    );

    return NextResponse.json({ data: valores });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}
