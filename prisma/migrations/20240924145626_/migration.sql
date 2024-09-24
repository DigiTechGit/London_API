/*
  Warnings:

  - You are about to drop the column `email` on the `Motorista` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Motorista` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idCircuit]` on the table `Motorista` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idCircuit` to the `Motorista` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Motorista" DROP COLUMN "email",
DROP COLUMN "nome",
ADD COLUMN     "idCircuit" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_idCircuit_key" ON "Motorista"("idCircuit");
