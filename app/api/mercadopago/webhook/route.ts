// app/api/mercadopago/webhook/route.ts
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

    // Consultar detalles del pago a MercadoPago
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

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.status !== 'pending') {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    // Activar usuario y crear tenant
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        status: 'active',
        tenant: {
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
        tenantId: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error en procesamiento de webhook' }, { status: 500 });
  }
}
