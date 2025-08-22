// app/api/renovar/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();

    if (!email || !['initial', 'annual'].includes(plan)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isAnual = plan === 'annual';

    const preference = {
      items: [
        {
          title: isAnual ? 'Licencia anual Stocking' : 'Licencia mensual Stocking',
          quantity: 1,
          unit_price: isAnual ? 144000 : 15000,
          currency_id: 'ARS'
        }
      ],
      external_reference: email,
      back_urls: {
        success: `${process.env.BASE_URL}/dashboard/user`,
        failure: `${process.env.BASE_URL}/dashboard/user`,
        pending: `${process.env.BASE_URL}/dashboard/user`
      },
      notification_url: `${process.env.BASE_URL}/api/mercadopago/webhook`,
      auto_return: 'approved',
      metadata: { plan }
    };

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await res.json();

    if (!data.init_point) {
      console.error('MercadoPago error:', data);
      return NextResponse.json({ error: 'No se pudo generar el pago' }, { status: 500 });
    }

    return NextResponse.json({ init_point: data.init_point }, { status: 200 });

  } catch (error) {
    console.error('Error en /api/renovar:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
