import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth';

export async function getUserFromCookies() {
  const token = cookies().get('token')?.value;
  if (!token) throw new Error('No autorizado');
  return await getTokenData(token);
}
