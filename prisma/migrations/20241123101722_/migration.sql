/*
  Warnings:

  - You are about to drop the `CNPJ` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CNPJ";

-- CreateTable
CREATE TABLE "cnpjTable" (
    "id" TEXT NOT NULL,
    "CNPJ" TEXT NOT NULL,
    "idAtivo" BOOLEAN NOT NULL,
    "desc" TEXT,

    CONSTRAINT "cnpjTable_pkey" PRIMARY KEY ("id")
);
