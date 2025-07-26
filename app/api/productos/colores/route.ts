import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const variantes = await prisma.varianteProducto.findMany({
      where: { color: { not: null } },
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


    return NextResponse.json(colores);
  } catch (error) {
    console.error('Error al cargar colores:', error);
    return NextResponse.json({ error: 'Error al cargar colores' }, { status: 500 });
  }
}
