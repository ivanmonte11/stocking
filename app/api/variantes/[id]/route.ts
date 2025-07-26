import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const varianteId = parseInt(id);
  if (isNaN(varianteId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const variante = await prisma.varianteProducto.findUnique({
      where: { id: varianteId },
      select: {
        id: true,
        producto: {
          select: {
            precio: true,
          },
        },
      },
    });

    if (!variante) {
      return NextResponse.json({ error: 'Variante no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ precio: variante.producto.precio });
  } catch (error) {
    console.error('Error al obtener variante:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
