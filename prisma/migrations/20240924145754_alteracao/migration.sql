/*
  Warnings:

  - The primary key for the `Motorista` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idCircuit` on the `Motorista` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Motorista_idCircuit_key";

-- AlterTable
ALTER TABLE "Motorista" DROP CONSTRAINT "Motorista_pkey",
DROP COLUMN "idCircuit",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Motorista_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Motorista_id_seq";
