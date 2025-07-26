import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs'; 

const prisma = new PrismaClient();

// GET: listar clientes con ventas
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ventas: true,
      },
    });

    const clientesConVentas = clientes.map(
  (cliente: typeof clientes[number]) => ({
    ...cliente,
    ventas: cliente.ventas ?? [],
  })
);


    return NextResponse.json(clientesConVentas);
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
