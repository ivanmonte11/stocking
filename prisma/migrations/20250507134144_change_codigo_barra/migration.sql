/*
  Warnings:

  - You are about to drop the column `codigo_barras` on the `Producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo_barra]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo_barra` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Producto_codigo_barras_key";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "codigo_barras",
ADD COLUMN     "codigo_barra" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_barra_key" ON "Producto"("codigo_barra");
