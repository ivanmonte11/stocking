import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const variantes = await prisma.varianteProducto.findMany({
      where: { productoId },
      select: {
        id: true,
        color: true,
        talla: true,
        stock: true,
      },
    });

    return NextResponse.json(variantes);
  } catch (error) {
    console.error('[GET_VARIANTES_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener variantes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const productoId = parseInt(params.id);
    const body = await req.json();

    if (isNaN(productoId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const { color, talla, stock, usuario } = body;

    if (!color || !talla || !stock || isNaN(stock)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Evitar duplicados exactos
    const existe = await prisma.varianteProducto.findFirst({
      where: {
        productoId,
        color: color.trim(),
        talla: talla.trim(),
      },
    });

    if (existe) {
      return NextResponse.json({ error: 'La variante ya existe' }, { status: 409 });
    }

    // Crear variante + movimiento dentro de una transacción
    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const nuevaVariante = await tx.varianteProducto.create({
        data: {
          productoId,
          color: color.trim(),
          talla: talla.trim(),
          stock: parseInt(stock),
        },
      });

      const movimiento = await tx.movimientoStock.create({
        data: {
          producto_id: productoId,
          varianteId: nuevaVariante.id,
          cantidad: parseInt(stock),
          tipo_movimiento: 'ENTRADA',
          motivo: `Carga inicial de nueva variante ${color}-${talla}`,
          usuario,
        },
      });

      return { nuevaVariante, movimiento };
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('[POST_VARIANTE_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al crear variante' },
      { status: 500 }
    );
  }
}
