-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('pending', 'active', 'archived');

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "status" "public"."EstadoUsuario" NOT NULL DEFAULT 'pending';
