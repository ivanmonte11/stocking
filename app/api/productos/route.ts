import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { productoSchema } from '@/lib/validations/productoSchema';
import { v4 as uuidv4, validate } from 'uuid';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const productos = await prisma.producto.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        fecha_creacion: 'desc',
      },
      include: {
        variantes: true,
      },
    });

    const total = await prisma.producto.count();

    return NextResponse.json({
      data: productos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsedBody = {
      ...body,
      precio: parseFloat(body.precio),
      costo: parseFloat(body.costo),
      variantes: body.variantes.map((v: any) => ({
        ...v,
        stock: parseInt(v.stock),
      })),
    };

    const validatedData = productoSchema.parse({
      ...parsedBody,
      codigo_barra: parsedBody.codigo_barra?.trim() || uuidv4().slice(0, 12).toUpperCase(),
    });

    // Primero, creamos el producto con sus variantes
    const producto = await prisma.producto.create({
      data: {
        codigo_barra: validatedData.codigo_barra,
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        costo: validatedData.costo,
        categoria: validatedData.categoria,
        variantes: {
          create: validatedData.variantes,
        },
      },
      include: {
        variantes: true,
      },
    });

    // Sumamos el total de stock (podés cambiar esto por un cálculo en base a costo o lo que prefieras)
    const totalStock = producto.variantes.reduce(
  (acc: number, variante: typeof producto.variantes[number]) => acc + variante.stock,
  0
);


    // Creamos una transacción general para esta entrada de producto
const transaccion = await prisma.transaccion.create({
  data: {
    tipo: 'COMPRA',
    fecha: new Date(),
    total: totalStock,
    movimientos: {
      create: producto.variantes
        .filter((v: typeof producto.variantes[number]) => v.stock > 0)
        .map((v: typeof producto.variantes[number]) => ({
          producto_id: producto.id,
          varianteId: v.id,
          cantidad: v.stock,
          tipo_movimiento: 'ENTRADA',
          motivo: `Stock inicial de variante ${v.color || ''}-${v.talla || ''}`,
        })),
    },
  },
  include: {
    movimientos: true,
  },
});

    return NextResponse.json({ producto, transaccion }, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El código de barras ya existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}


