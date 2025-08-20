// api/mercadopago/verificar-pago.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email no proporcionado' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { status: true, accesoHasta: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const hoy = new Date();
  const activo = user.status === 'active' && user.accesoHasta && user.accesoHasta > hoy;

  return NextResponse.json({ licenciaActiva: activo });
}
