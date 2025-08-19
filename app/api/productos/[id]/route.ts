import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { productoSchema } from '@/lib/validations/productoSchema';
import { error } from 'console';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no disponible' },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Se parsean primero los números que vienen como strings
    const parsedBody = {
      ...body,
      precio: body.precio ? parseFloat(body.precio) : 0,
      costo: body.costo ? parseFloat(body.costo) : 0,
      stock: body.stock ? parseInt(body.stock) : 0
    };

    const validatedData = productoSchema.parse(parsedBody);

    const productoExistente = await prisma.producto.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!productoExistente) {
  return NextResponse.json(
    { error: 'Producto no encontrado' },
    { status: 404 }
  );
}



    const producto = await prisma.producto.update({
      where: { id: parseInt(params.id) },
      data: {
        codigoBarra: validatedData.codigoBarra,
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        costo: validatedData.costo,
        categoria: validatedData.categoria,
        fechaActualizacion: new Date(),
        estado: validatedData.estado,

      },
    });

    return NextResponse.json(producto);
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
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { estado } = await request.json();

    if (!['activo', 'archivado'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const producto = await prisma.producto.update({
      where: { id: parseInt(params.id) },
      data: {
        estado,
        fechaActualizacion: new Date(),
      },
    });

    return NextResponse.json(producto);
  } catch (error: any) {
    console.error('Error en PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productoId = parseInt(params.id);

  try {
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    if (producto.estado === 'archivado') {
      return NextResponse.json(
        { message: 'El producto ya está archivado' },
        { status: 200 }
      );
    }

    await prisma.producto.update({
      where: { id: productoId },
      data: { estado: 'archivado' },
    });

    return NextResponse.json(
      { message: 'Producto archivado correctamente' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error al archivar producto:', error);

    return NextResponse.json(
      { error: 'Error al archivar producto' },
      { status: 500 }
    );
  }
}

