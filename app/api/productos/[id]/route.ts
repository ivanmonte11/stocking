import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { productoSchema } from '@/lib/validations/productoSchema';

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
        { error: 'Producto no encontrado' },
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

    const validatedData = productoSchema.parse(body);

    const producto = await prisma.producto.update({
      where: { id: parseInt(params.id) },
      data: {
      codigo_barra: validatedData.codigo_barra,
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        costo: validatedData.costo,
        categoria: validatedData.categoria,     
        fecha_actualizacion: new Date(),
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.producto.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(
      { message: 'Producto eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}