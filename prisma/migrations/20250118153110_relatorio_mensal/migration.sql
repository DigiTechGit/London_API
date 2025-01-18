-- CreateTable
CREATE TABLE "RelatorioMensal" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "totalEntregas" TEXT NOT NULL,
    "motoristasUnicos" TEXT NOT NULL,
    "placasUnicas" TEXT NOT NULL,

    CONSTRAINT "RelatorioMensal_pkey" PRIMARY KEY ("id")
);
