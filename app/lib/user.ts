import { prisma } from './prisma';

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateUserPassword(email: string, hashedPassword: string) {
  return prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
}
