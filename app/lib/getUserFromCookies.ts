import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UserPayload = {
  id: number;
  tenantId: number;
};

export async function getUserFromCookies(): Promise<UserPayload> {
  const token = cookies().get('token')?.value;
  if (!token) throw new Error('No autorizado');

  const decoded = getTokenData(token);
  if (!decoded?.id) throw new Error('Token inválido');

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      tenantId: true,
      status: true,
      accesoHasta: true,
    },
  });

  if (!user) throw new Error('Usuario no encontrado');
  if (user.status !== 'active') throw new Error('Usuario inactivo');
  if (!user.tenantId) throw new Error('Usuario sin tenant asignado');

  const ahora = new Date();
  const vencimiento = user.accesoHasta ? new Date(user.accesoHasta) : null;
  if (!vencimiento || vencimiento < ahora) throw new Error('Licencia vencida');

  return {
    id: user.id,
    tenantId: user.tenantId,
  };
}
