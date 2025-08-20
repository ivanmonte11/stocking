import type { NextApiRequest, NextApiResponse } from 'next';
import { paymentClient } from '@/lib/mercadopago';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { payment_id } = req.query;

  if (!payment_id || typeof payment_id !== 'string') {
    return res.status(400).json({ error: 'Falta el payment_id' });
  }

  try {
    const payment = await paymentClient.get({ id: payment_id });
    const email = payment.payer?.email;

    if (!email) {
      return res.status(404).json({ error: 'No se encontró el email asociado al pago' });
    }

    return res.status(200).json({ email });
  } catch (error) {
    console.error('[API] Error al consultar MercadoPago:', error);
    return res.status(500).json({ error: 'Error interno al consultar el pago' });
  }
}
