-- CreateEnum
CREATE TYPE "public"."EstadoProducto" AS ENUM ('activo', 'archivado');

-- AlterTable
ALTER TABLE "public"."Producto" ADD COLUMN     "estado" "public"."EstadoProducto" NOT NULL DEFAULT 'activo';
