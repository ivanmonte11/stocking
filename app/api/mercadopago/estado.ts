import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');

  if (!paymentId) {
    return NextResponse.json({ error: 'ID de pago no proporcionado' }, { status: 400 });
  }

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
    }
  });

  const pago = await res.json();
  const motivo = pago.status_detail;

  return NextResponse.json({ motivo });
}
