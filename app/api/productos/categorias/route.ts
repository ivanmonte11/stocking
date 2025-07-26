// app/api/productos/categorias/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categorias = await prisma.producto.findMany({
      where: { categoria: { not: null } },
      select: { categoria: true },
      distinct: ['categoria'],
    });

    const valores = categorias
  .map((c: { categoria: string | null }) => c.categoria?.trim())
  .filter(Boolean) as string[];


    return NextResponse.json(valores);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}
