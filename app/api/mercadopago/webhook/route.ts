import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const paymentId = body.data?.id;
    const topic = body.type;

    if (topic !== 'payment') {
      console.warn('🔕 Webhook ignorado: tipo no es "payment"', topic);
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
      console.warn('⛔ Pago no aprobado:', payment.status);
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    // 🧠 Parsear referencia editorial
    const externalRef = payment.external_reference;
    const [userIdStr, email] = externalRef?.split(':') ?? [];

    const plan = payment.metadata?.plan;
    const meses = plan === 'annual' ? 12 : 1;

    if (!userIdStr || !email || !['initial', 'annual'].includes(plan)) {
      console.warn('⚠️ Webhook ignorado: referencia o plan inválido', { externalRef, plan });
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    const userId = Number(userIdStr);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.email !== email) {
      console.warn('❌ Usuario no encontrado o email no coincide:', { userId, email });
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    // 📅 Calcular nueva fecha de acceso
    const hoy = new Date();
    const base = user.accesoHasta && user.accesoHasta > hoy ? user.accesoHasta : hoy;
    const nuevaFecha = new Date(base);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);

    // 🛠️ Preparar actualización editorial
    const updateData: any = {
      accesoHasta: nuevaFecha,
      status: user.status === 'pending' ? 'active' : user.status
    };

    if (!user.tenantId) {
      updateData.tenant = {
        create: {
          nombre: `${user.name}'s tenant`
        }
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        accesoHasta: true,
        tenantId: true
      }
    });

    console.log('✅ Webhook procesado:', {
      userId,
      email,
      plan,
      nuevaFecha,
      status: updatedUser.status,
      tenantId: updatedUser.tenantId
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('🔥 Error en webhook:', error);
    return NextResponse.json({ error: 'Error interno en webhook' }, { status: 500 });
  }
}
