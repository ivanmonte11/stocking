import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        const preference = {
            items: [{
                title: 'Licencia mensual Stocking SaaS',
                description: 'Acceso institucional al sistema de gestión multi-tenant',
                quantity: 1,
                unit_price: 25000,
                currency_id: 'ARS'
            }],

            external_reference: email,
            back_urls: {
                success: 'https://tusitio.com/success',
                failure: 'https://tusitio.com/failure',
                pending: 'https://tusitio.com/pending'
            },
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

        if (!data?.init_point || typeof data.init_point !== 'string') {
            console.error('Preferencia inválida:', data);
            return NextResponse.json({ error: 'No se pudo generar el enlace de pago' }, { status: 500 });
        }

        return NextResponse.json({ init_point: data.init_point });
    } catch (err) {
        console.error('Error en el endpoint de MercadoPago:', err);
        return NextResponse.json({ error: 'Error interno al generar preferencia' }, { status: 500 });
    }
}
