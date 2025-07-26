/*
  Warnings:

  - You are about to drop the column `color` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `talla` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "color",
DROP COLUMN "stock",
DROP COLUMN "talla";

-- CreateTable
CREATE TABLE "VarianteProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "color" TEXT,
    "talla" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VarianteProducto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VarianteProducto" ADD CONSTRAINT "VarianteProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
