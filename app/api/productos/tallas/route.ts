import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/getUserFromCookies'; // o donde lo tengas

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await getUserFromCookies();

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
          .map((v: { talla: string | null }) => v.talla?.trim())
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({ data: tallas });
  } catch (error) {
    console.error('Error al cargar tallas:', error);
    return NextResponse.json({ error: 'Error al cargar tallas' }, { status: 500 });
  }
}
