import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const config = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export const preferenceClient = new Preference(config);
export const paymentClient = new Payment(config);
