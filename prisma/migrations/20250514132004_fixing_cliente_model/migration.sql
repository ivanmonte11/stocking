/*
  Warnings:

  - You are about to drop the column `direccion` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "direccion",
ADD COLUMN     "email" TEXT;
