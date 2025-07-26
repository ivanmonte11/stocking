import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const movimientos = await request.json();

  try {
    for (const mov of movimientos) {
      const {
        producto_id,
        variante_id,
        cantidad,
        tipo_movimiento,
        motivo,
        usuario,
      } = mov;

      const varianteIdInt = parseInt(variante_id);
      const productoIdInt = parseInt(producto_id);

      const variante = await prisma.varianteProducto.findUnique({
        where: { id: varianteIdInt },
      });

      if (!variante) continue;

      let nuevoStock = variante.stock;

      if (tipo_movimiento === 'ENTRADA') {
        nuevoStock += cantidad;
      } else if (tipo_movimiento === 'SALIDA') {
        if (variante.stock < cantidad) {
          continue;
        }
        nuevoStock -= cantidad;
      }

      await prisma.movimientoStock.create({
        data: {
          producto_id: productoIdInt,
          varianteId: varianteIdInt,
          cantidad,
          tipo_movimiento,
          motivo,
          usuario,
          fecha: new Date(),
        },
      });

      await prisma.varianteProducto.update({
        where: { id: varianteIdInt },
        data: { stock: nuevoStock },
      });
    }

    return NextResponse.json({ message: 'Movimientos registrados correctamente.' });
  } catch (error) {
    console.error('[MOVIMIENTO_BATCH_ERROR]', error);
    return NextResponse.json({ error: 'Error al registrar movimientos.' }, { status: 500 });
  }
}
