// app/api/productos/categorias/route.ts
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

    const categorias = await prisma.producto.findMany({
    where: { 
        categoria: { not: null },
        tenantId: user.tenantId
      },
      select: { categoria: true },
      distinct: ['categoria'],
    });

  const valores = Array.from(new Set(
  categorias
    .map((c) => c.categoria?.trim())
    .filter(Boolean)
));



    return NextResponse.json({ data: valores });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}
