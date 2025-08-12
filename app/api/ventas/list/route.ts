import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await getTokenData(token);
  if (!user?.tenantId) return NextResponse.json({ error: 'Tenant no definido' }, { status: 400 });

  const tenantId = user.tenantId;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '10');

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const where: any = {
    tenantId,
  };

  if (startDate && endDate) {
    where.fecha = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const total = await prisma.venta.count({ where });

  const ventas = await prisma.venta.findMany({
    where,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: {
      fecha: 'desc',
    },
    include: {
      variante: {
        include: {
          producto: true,
        },
      },
      cliente: true,
    },
  });

  return NextResponse.json({ total, ventas });
}
