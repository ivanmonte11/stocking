import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params?: { id?: string } } // Protección contra ausencia de params
) {
  const idStr = context.params?.id;
  const id = idStr ? parseInt(idStr) : NaN;

  console.log('GET /api/clientes/[id] →', id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        ventas: {
          include: {
            variante: {
              include: {
                producto: true,
              },
            },
          },
          orderBy: {
            fecha: 'desc',
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
