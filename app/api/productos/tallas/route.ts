import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const variantes = await prisma.varianteProducto.findMany({
      where: { talla: { not: null } },
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


    return NextResponse.json(tallas);
  } catch (error) {
    console.error('Error al cargar tallas:', error);
    return NextResponse.json({ error: 'Error al cargar tallas' }, { status: 500 });
  }
}
