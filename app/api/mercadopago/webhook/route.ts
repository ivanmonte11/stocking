// app/api/mercadopago/webhook/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const paymentId = body.data?.id;
    const topic = body.type;

    if (topic !== 'payment') {
      console.warn('Webhook ignorado: tipo no es "payment"', topic);
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    // 🧾 Consultar detalles del pago
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    const payment = await res.json();

    if (payment.status !== 'approved') {
      console.warn('Pago no aprobado:', payment.status);
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    const email = payment.external_reference;
    const plan = payment.metadata?.plan;
    const meses = plan === 'annual' ? 12 : 1;

    if (!email || !['initial', 'annual'].includes(plan)) {
      console.warn('Webhook ignorado: email o plan inválido', { email, plan });
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn('Usuario no encontrado en webhook:', email);
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    // 📅 Calcular nueva fecha de acceso
    const hoy = new Date();
    const base = user.accesoHasta && user.accesoHasta > hoy ? user.accesoHasta : hoy;
    const nuevaFecha = new Date(base);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);

    // 🛠️ Actualizar acceso y activar si estaba pendiente
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

    console.log('Webhook procesado correctamente para:', email, '→', plan, '→', nuevaFecha);

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error en procesamiento de webhook:', error);
    return NextResponse.json({ error: 'Error interno en webhook' }, { status: 500 });
  }
}
