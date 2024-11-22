-- CreateTable
CREATE TABLE "CNPJ" (
    "id" TEXT NOT NULL,
    "CNPJ" TEXT NOT NULL,
    "idAtivo" BOOLEAN NOT NULL,
    "desc" TEXT,

    CONSTRAINT "CNPJ_pkey" PRIMARY KEY ("id")
);
