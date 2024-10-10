/*
  Warnings:

  - You are about to drop the column `alterado` on the `Ctes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ctes" DROP COLUMN "alterado",
ADD COLUMN     "dt_alteracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
