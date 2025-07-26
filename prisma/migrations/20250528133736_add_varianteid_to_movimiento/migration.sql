/*
  Warnings:

  - Added the required column `varianteId` to the `MovimientoStock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MovimientoStock" ADD COLUMN     "varianteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
