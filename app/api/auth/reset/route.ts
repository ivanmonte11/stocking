import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { updateUserPassword } from '@/lib/user';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || typeof password !== 'string') {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    const hashed = await bcrypt.hash(password, 10);

    await updateUserPassword(decoded.email, hashed);

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('[RESET] Error:', err);
    return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 400 });
  }
}
