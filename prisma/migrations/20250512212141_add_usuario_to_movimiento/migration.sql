/*
  Warnings:

  - Changed the type of `tipo_movimiento` on the `MovimientoStock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA');

-- AlterTable
ALTER TABLE "MovimientoStock" ADD COLUMN     "usuarios" TEXT,
DROP COLUMN "tipo_movimiento",
ADD COLUMN     "tipo_movimiento" "TipoMovimiento" NOT NULL;
