import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth';

export const runtime = 'nodejs'; 

const prisma = new PrismaClient();

// GET: listar clientes con ventas
export async function GET() {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await getTokenData(token);
  if (!user?.tenantId) return NextResponse.json({ error: 'Tenant no definido' }, { status: 400 });

  try {
    const clientes = await prisma.cliente.findMany({
      where: { tenantId: user.tenantId }, // <-- filtro tenant aquí
      orderBy: { createdAt: 'desc' },
      include: {
        ventas: true,
      },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}


// POST: crear cliente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, telefono } = body;

    const nuevoCliente = await prisma.cliente.create({
      data: { nombre, telefono },
    });

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    );
  }
}
