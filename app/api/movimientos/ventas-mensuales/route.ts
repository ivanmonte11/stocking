import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const ventas = await prisma.movimientoStock.groupBy({
      by: ['tipo_movimiento'],
      _sum: {
        cantidad: true,
      },
    });

    // Si necesitas agrupado por mes y año:
    const result = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "fecha") as mes,
        SUM("cantidad") as total
      FROM "MovimientoStock"
      WHERE "tipo_movimiento" = 'SALIDA' AND "motivo"  ILIKE '%venta%'
      GROUP BY mes
      ORDER BY mes;
    `;

    // Formatear respuesta
    const data = (result as any[]).map((row) => {
      const fecha = new Date(row.mes);
      const nombreMes = new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' }).format(fecha);
      const anio = fecha.getFullYear();
      return {
        mes: `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${anio}`,
        cantidad: Number(row.total),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[VENTAS_MENSUALES_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener ventas mensuales' },
      { status: 500 }
    );
  }
}
