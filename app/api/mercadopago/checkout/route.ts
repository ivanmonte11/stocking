import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email no proporcionado' }, { status: 400 });
    }

    const esAnual = plan === 'annual';

    const preference = {
      items: [
        {
          title: esAnual
            ? 'Licencia anual Stocking SaaS'
            : 'Licencia mensual Stocking SaaS',
          description: 'Acceso institucional al sistema de gestión multi-tenant',
          quantity: 1,
          unit_price: esAnual ? 144000 : 15000,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email
      },
      external_reference: email,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/pago`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pago`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pago`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
      metadata: {
        plan: esAnual ? 'annual' : 'initial'
      }
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

    if (!data?.init_point || typeof data.init_point !== 'string') {
      console.error('[MP] Preferencia inválida:', data);
      return NextResponse.json({ error: 'No se pudo generar el enlace de pago' }, { status: 500 });
    }

    return NextResponse.json({ init_point: data.init_point }, { status: 200 });
  } catch (err) {
    console.error('[API] Error al generar preferencia:', err);
    return NextResponse.json({ error: 'Error interno al generar preferencia' }, { status: 500 });
  }
}
