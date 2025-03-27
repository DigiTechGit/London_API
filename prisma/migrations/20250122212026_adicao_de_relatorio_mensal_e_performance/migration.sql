-- CreateTable
CREATE TABLE "RelatorioMensal" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "totalEntregas" TEXT NOT NULL,
    "motoristasUnicos" TEXT NOT NULL,
    "placasUnicas" TEXT NOT NULL,

    CONSTRAINT "RelatorioMensal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatorioPerformance" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "totalEntregue" TEXT NOT NULL,
    "totalNaoEntregue" TEXT NOT NULL,
    "nomeMotorista" TEXT NOT NULL,
    "placaMotorista" TEXT NOT NULL,

    CONSTRAINT "RelatorioPerformance_pkey" PRIMARY KEY ("id")
);
