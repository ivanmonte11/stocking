import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { productoSchema } from '@/lib/validations/productoSchema';
import { error } from 'console';
import { getUserFromCookies } from '@/lib/getUserFromCookies';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromCookies();
    
    const producto = await prisma.producto.findUnique({
      where: { 
        id: parseInt(params.id),
        tenantId: user.tenantId 
      },
      include: {
        variantes: true // ← ¡ESTO ES CRUCIAL!
      }
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
    const user = await getUserFromCookies();
    const body = await request.json();

    const parsedBody = {
      ...body,
      precio: body.precio ? parseFloat(body.precio) : 0,
      costo: body.costo ? parseFloat(body.costo) : 0,
      variantes: body.variantes ? body.variantes.map((v: any) => ({
        ...v,
        stock: v.stock ? parseInt(v.stock) : 0
      })) : []
    };

    const validatedData = productoSchema.parse(parsedBody);

    const productoExistente = await prisma.producto.findUnique({
      where: { 
        id: parseInt(params.id),
        tenantId: user.tenantId 
      },
      include: { 
        variantes: {
          where: { tenantId: user.tenantId },
          include: {
            movimientos: true // ← Verificar si tiene movimientos
          }
        } 
      }
    });

    if (!productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const producto = await prisma.$transaction(async (tx) => {
      // 1. Primero manejar variantes existentes
      for (const varianteExistente of productoExistente.variantes) {
        const varianteEnFormulario = validatedData.variantes.find(
          (v: any) => v.color === varianteExistente.color && 
                     v.talla === varianteExistente.talla
        );

        if (varianteEnFormulario) {
          // Actualizar variante existente
          await tx.varianteProducto.update({
            where: { 
              id: varianteExistente.id,
              tenantId: user.tenantId 
            },
            data: {
              color: varianteEnFormulario.color,
              talla: varianteEnFormulario.talla,
              stock: varianteEnFormulario.stock
            }
          });
        } else {
          // Verificar si la variante tiene movimientos antes de eliminar
          const tieneMovimientos = varianteExistente.movimientos.length > 0;
          
          if (tieneMovimientos) {
            // Si tiene movimientos, mantener la variante pero setear stock a 0
            await tx.varianteProducto.update({
              where: { 
                id: varianteExistente.id,
                tenantId: user.tenantId 
              },
              data: {
                stock: 0,
                // Opcional: marcar como inactiva en lugar de eliminar
                // estado: 'inactiva'
              }
            });
          } else {
            // Si no tiene movimientos, eliminar
            await tx.varianteProducto.delete({
              where: { 
                id: varianteExistente.id,
                tenantId: user.tenantId 
              }
            });
          }
        }
      }

      // 2. Crear nuevas variantes que no existían
      for (const varianteNueva of validatedData.variantes) {
        const varianteYaExiste = productoExistente.variantes.some(
          (v: any) => v.color === varianteNueva.color && 
                     v.talla === varianteNueva.talla
        );

        if (!varianteYaExiste) {
          await tx.varianteProducto.create({
            data: {
              color: varianteNueva.color,
              talla: varianteNueva.talla,
              stock: varianteNueva.stock,
              productoId: parseInt(params.id),
              tenantId: user.tenantId
            }
          });
        }
      }

      // 3. Actualizar el producto principal
      return await tx.producto.update({
        where: { 
          id: parseInt(params.id),
          tenantId: user.tenantId 
        },
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
        include: {
          variantes: {
            where: { tenantId: user.tenantId }
          }
        }
      });
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
      { error: 'Error al actualizar producto', details: error.message },
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

