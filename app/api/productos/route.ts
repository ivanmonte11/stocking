import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { productoSchema } from '@/lib/validations/productoSchema';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const prisma = new PrismaClient();

// 📦 GET: Obtener productos paginados del tenant actual
export async function GET(request: Request) {
  try {
    const user = await getUserFromCookies();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const productos = await prisma.producto.findMany({
      where: { tenantId: user.tenantId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        variantes: true,
      },
    });

    const total = await prisma.producto.count({
      where: { tenantId: user.tenantId },
    });

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
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// 🧾 POST: Crear producto y transacción inicial
export async function POST(request: Request) {
  try {
    const user = await getUserFromCookies();
    const body = await request.json();

    const parsedBody = {
      ...body,
      precio: parseFloat(body.precio),
      costo: parseFloat(body.costo),
      variantes: body.variantes.map((v: any) => ({
        ...v,
        stock: parseInt(v.stock, 10) || 0,
      })),
    };

    const validatedData = productoSchema.parse({
      ...parsedBody,
      codigoBarra: parsedBody.codigoBarra?.trim() || uuidv4().slice(0, 12).toUpperCase(),
    });

    const producto = await prisma.producto.create({
      data: {
        codigoBarra: validatedData.codigoBarra,
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        costo: validatedData.costo,
        categoria: validatedData.categoria,
        tenantId: user.tenantId,
        creadoPorId: user.id,
        variantes: {
          create: validatedData.variantes.map(v => ({
            ...v,
            tenantId: user.tenantId,
          })),
        },
      },
      include: {
        variantes: true,
      },
    });

    const variantesConStock = producto.variantes.filter(v => v.stock > 0);
    const totalStock = variantesConStock.reduce((acc, v) => acc + v.stock, 0);

    const transaccion = await prisma.transaccion.create({
      data: {
        tipo: 'COMPRA',
        fecha: new Date(),
        total: totalStock,
        tenantId: user.tenantId,
        usuarioId: user.id,
        movimientos: {
          create: variantesConStock.map(v => ({
            cantidad: v.stock,
            tipoMovimiento: 'ENTRADA',
            motivo: `Stock inicial de variante ${v.color || ''}-${v.talla || ''}`,
            fecha: new Date(),
            productoId: producto.id,
            varianteId: v.id,
            usuarioId: user.id,
            tenantId: user.tenantId,
          })),
        },
      },
      include: {
        movimientos: true,
      },
    });

    return NextResponse.json({ producto, transaccion }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error instanceof Error ? error.message : error);

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
