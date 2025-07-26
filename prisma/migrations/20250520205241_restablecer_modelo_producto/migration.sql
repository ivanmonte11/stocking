/*
  Warnings:

  - You are about to drop the `VarianteProducto` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[codigo_barra]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "VarianteProducto" DROP CONSTRAINT "VarianteProducto_productoId_fkey";

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "codigo_barra" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "costo" DOUBLE PRECISION,
ADD COLUMN     "precio" DOUBLE PRECISION,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "talla" TEXT;

-- DropTable
DROP TABLE "VarianteProducto";

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_barra_key" ON "Producto"("codigo_barra");
