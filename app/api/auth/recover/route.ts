import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '@/lib/user';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email requerido' }), { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) return new Response(null, { status: 200 }); // no revelamos si existe

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Stocking SaaS <no-reply@stocking.work>',
      to: email,
      subject: 'Recuperación de acceso',
      html: `
        <p>Recibimos tu solicitud para recuperar el acceso.</p>
        <p><a href="${resetUrl}">🔐 Restablecer clave</a></p>
        <p>Este enlace vence en 15 minutos.</p>
        <p>Si no lo solicitaste, ignorá este mensaje.</p>
      `,
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('[RECOVER] Error:', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
}
