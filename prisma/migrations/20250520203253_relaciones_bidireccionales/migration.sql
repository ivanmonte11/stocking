/*
  Warnings:

  - You are about to drop the column `codigo_barra` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `costo` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `talla` on the `Producto` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Producto_codigo_barra_key";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "codigo_barra",
DROP COLUMN "color",
DROP COLUMN "costo",
DROP COLUMN "precio",
DROP COLUMN "stock",
DROP COLUMN "talla";

-- CreateTable
CREATE TABLE "VarianteProducto" (
    "id" SERIAL NOT NULL,
    "codigo_barra" TEXT NOT NULL,
    "color" TEXT,
    "talla" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "VarianteProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VarianteProducto_codigo_barra_key" ON "VarianteProducto"("codigo_barra");

-- AddForeignKey
ALTER TABLE "VarianteProducto" ADD CONSTRAINT "VarianteProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
