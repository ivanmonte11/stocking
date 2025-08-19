-- DropForeignKey
ALTER TABLE "public"."usuarios" DROP CONSTRAINT "usuarios_tenantId_fkey";

-- AlterTable
ALTER TABLE "public"."usuarios" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
