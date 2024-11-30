-- AlterTable
ALTER TABLE "Ctes" ADD COLUMN     "codUltOco" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CnpjTb" (
    "id" TEXT NOT NULL,
    "CNPJ" TEXT NOT NULL,
    "idAtivo" BOOLEAN NOT NULL,
    "desc" TEXT,

    CONSTRAINT "CnpjTb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" SERIAL NOT NULL,
    "chaveNFe" TEXT,
    "serNF" TEXT,
    "nroNF" INTEGER NOT NULL,
    "nroPedido" TEXT,
    "qtdeVolumes" INTEGER NOT NULL,
    "pesoReal" DOUBLE PRECISION NOT NULL,
    "metragemCubica" DOUBLE PRECISION NOT NULL,
    "valorMercadoria" DOUBLE PRECISION NOT NULL,
    "ctesId" INTEGER NOT NULL,

    CONSTRAINT "NotaFiscal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_ctesId_fkey" FOREIGN KEY ("ctesId") REFERENCES "Ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
