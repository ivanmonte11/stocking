-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('VENTA', 'COMPRA', 'AJUSTE');

-- AlterTable
ALTER TABLE "MovimientoStock" ADD COLUMN     "transaccionId" INTEGER;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "precio_unitario" DOUBLE PRECISION,
ADD COLUMN     "subtotal" DOUBLE PRECISION,
ADD COLUMN     "transaccionId" INTEGER;

-- CreateTable
CREATE TABLE "Transaccion" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoTransaccion" NOT NULL,
    "clienteId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaccion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_transaccionId_fkey" FOREIGN KEY ("transaccionId") REFERENCES "Transaccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_transaccionId_fkey" FOREIGN KEY ("transaccionId") REFERENCES "Transaccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
