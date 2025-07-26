/*
  Warnings:

  - Made the column `costo` on table `Producto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `precio` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "costo" SET NOT NULL,
ALTER COLUMN "precio" SET NOT NULL;
