import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const paymentId = body.data?.id;
    const topic = body.type;

    if (topic !== 'payment') {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    //  Consultar detalles del pago
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    const payment = await res.json();

    if (payment.status !== 'approved') {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    const email = payment.external_reference;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    //  Calcular nueva fecha de acceso
    const hoy = new Date();
    const base = user.accesoHasta && user.accesoHasta > hoy ? user.accesoHasta : hoy;
    const nuevaFecha = new Date(base);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1); // suma 1 mes

    //  Actualizar acceso y activar si estaba pendiente
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        accesoHasta: nuevaFecha,
        status: user.status === 'pending' ? 'active' : user.status,
        tenant: user.tenantId
          ? undefined
          : {
              create: {
                nombre: `${user.name}'s tenant`
              }
            }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        accesoHasta: true,
        tenantId: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error en procesamiento de webhook' }, { status: 500 });
  }
}
