/*
  Warnings:

  - You are about to drop the column `usuarios` on the `MovimientoStock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovimientoStock" DROP COLUMN "usuarios",
ADD COLUMN     "usuario" TEXT;
