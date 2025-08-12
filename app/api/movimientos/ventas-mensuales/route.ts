import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth'; // función que decodifica token y obtiene datos

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await getTokenData(token);
    if (!user?.tenantId) return NextResponse.json({ error: 'Tenant no definido' }, { status: 400 });

    const tenantId = user.tenantId;

    const result = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "fecha") as mes,
        SUM("cantidad") as total
      FROM "MovimientoStock"
      WHERE "tipoMovimiento" = 'SALIDA' 
        AND "motivo" ILIKE '%venta%'
        AND "tenantId" = ${tenantId}
      GROUP BY mes
      ORDER BY mes;
    `;

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
