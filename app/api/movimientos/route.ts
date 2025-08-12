import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth';

const prisma = new PrismaClient();

interface MovimientoFormatted {
  id: number;
  fecha: Date;
  producto: string;
  tipo: string;
  cantidad: number;
  motivo: string | null;
  usuario: string;
}
interface VarianteMovimiento {
  varianteId: string;
  cantidad: number;
}

interface MovimientoRequestBody {
  productoId: string;
  tipoMovimiento: 'ENTRADA' | 'SALIDA';
  motivo?: string;
  usuario?: string;
  variantes: VarianteMovimiento[];
}

export async function GET(request: Request) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await getTokenData(token);
  if (!user?.tenantId) return NextResponse.json({ error: 'Tenant no definido' }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit')) || 10;
  const periodo = searchParams.get('periodo');

  let fechaInicio: Date | undefined;
  let fechaFin: Date = new Date();

  switch (periodo) {
    case 'hoy':
      fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay());
      fechaInicio.setHours(0, 0, 0, 0);
      break;
    case 'mes':
      fechaInicio = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);
      break;
    case 'mes_pasado':
      fechaInicio = new Date(fechaFin.getFullYear(), fechaFin.getMonth() - 1, 1);
      fechaFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 0, 23, 59, 59);
      break;
  }

  try {
    const movimientos = await prisma.movimientoStock.findMany({
      take: limit,
      where: {
        producto: {
          is: {
            tenantId: user.tenantId,
          },
        },
        ...(fechaInicio && {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        }),
      },
      orderBy: {
        fecha: 'desc',
      },
      include: {
        variante: {
          include: {
            producto: {
              select: {
                nombre: true,
              },
            },
          },
        },
        usuario: true,
      },
    });

    const formattedMovimientos: MovimientoFormatted[] = movimientos.map((mov): MovimientoFormatted => ({
  id: mov.id,
  fecha: mov.fecha,
  producto: mov.variante.producto.nombre,
  tipo: mov.tipoMovimiento,
  cantidad: mov.cantidad,
  motivo: mov.motivo,
  usuario: mov.usuario?.name || 'Desconocido',
}));


    return NextResponse.json(formattedMovimientos);
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await getTokenData(token);
  if (!user?.id || !user?.tenantId) {
    return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 });
  }

  try {
    const body: MovimientoRequestBody = await request.json();
    const { productoId, tipoMovimiento, motivo, usuario, variantes } = body;

    const productoIdInt = parseInt(productoId, 10);
    if (isNaN(productoIdInt)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    let tipoTransaccion: 'VENTA' | 'COMPRA' | 'AJUSTE';
    if (tipoMovimiento === 'ENTRADA') {
      tipoTransaccion = 'AJUSTE';
    } else if (tipoMovimiento === 'SALIDA') {
      tipoTransaccion = 'VENTA';
    } else {
      return NextResponse.json({ error: 'Tipo de movimiento inválido' }, { status: 400 });
    }

    const movimientosData = [];
    let totalMovimiento = 0;

    for (const mov of variantes as VarianteMovimiento[]) {
  const varianteIdInt = parseInt(mov.varianteId, 10);
      if (isNaN(varianteIdInt) || mov.cantidad <= 0) continue;

      const variante = await prisma.varianteProducto.findUnique({
        where: { id: varianteIdInt },
      });

      if (!variante) continue;

      movimientosData.push({
        productoId: productoIdInt,
        varianteId: varianteIdInt,
        cantidad: mov.cantidad,
        tipoMovimiento,
        motivo,
        usuarioId: user.id,
        fecha: new Date(),
        tenantId: user.tenantId,
      });

      totalMovimiento += mov.cantidad;
    }

    const transaccion = await prisma.transaccion.create({
      data: {
        tipo: tipoTransaccion,
        usuarioId: user.id,
        fecha: new Date(),
        total: totalMovimiento,
        tenantId: user.tenantId,
        movimientos: {
          create: movimientosData,
        },
      },
    });

    for (const mov of variantes) {
      const varianteIdInt = parseInt(mov.varianteId, 10);
      if (isNaN(varianteIdInt) || mov.cantidad <= 0) continue;

      const variante = await prisma.varianteProducto.findUnique({
        where: { id: varianteIdInt },
      });

      if (!variante) continue;

      let nuevoStock = variante.stock;

      if (tipoMovimiento === 'ENTRADA') {
        nuevoStock += mov.cantidad;
      } else if (tipoMovimiento === 'SALIDA') {
        if (variante.stock < mov.cantidad) continue;
        nuevoStock -= mov.cantidad;
      }

      await prisma.varianteProducto.update({
        where: { id: varianteIdInt },
        data: { stock: nuevoStock },
      });
    }

    return NextResponse.json({ message: 'Movimientos registrados correctamente.', transaccion });
  } catch (error) {
    console.error('[MOVIMIENTO_BATCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al registrar movimientos.' },
      { status: 500 }
    );
  }
}
