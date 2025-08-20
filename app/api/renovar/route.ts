// app/api/renovar/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-temporal';

export async function POST(request: Request) {
  try {
    // 🧠 Extraer token del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    const email = decoded.email;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 🧾 Crear preferencia de pago
    const preference = {
      items: [
        {
          title: 'Renovación de licencia mensual',
          quantity: 1,
          unit_price: 20000, // 💰 ajustar según el modelo
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
      auto_return: 'approved'
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
