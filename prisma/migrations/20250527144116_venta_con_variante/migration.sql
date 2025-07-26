/*
  Warnings:

  - You are about to drop the column `productoId` on the `Venta` table. All the data in the column will be lost.
  - Added the required column `varianteId` to the `Venta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_productoId_fkey";

-- AlterTable
ALTER TABLE "Venta" DROP COLUMN "productoId",
ADD COLUMN     "varianteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
