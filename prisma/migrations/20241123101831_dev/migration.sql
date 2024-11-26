/*
  Warnings:

  - You are about to drop the `cnpjTable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "cnpjTable";

-- CreateTable
CREATE TABLE "CnpjTb" (
    "id" TEXT NOT NULL,
    "CNPJ" TEXT NOT NULL,
    "idAtivo" BOOLEAN NOT NULL,
    "desc" TEXT,

    CONSTRAINT "CnpjTb_pkey" PRIMARY KEY ("id")
);
