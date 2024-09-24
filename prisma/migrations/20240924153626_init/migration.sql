/*
  Warnings:

  - The primary key for the `Motorista` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Motorista` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `idCircuit` to the `Motorista` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Motorista" DROP CONSTRAINT "Motorista_pkey",
ADD COLUMN     "idCircuit" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Motorista_pkey" PRIMARY KEY ("id");
