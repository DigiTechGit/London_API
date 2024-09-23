-- CreateTable
CREATE TABLE "Motorista" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Motorista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ctes" (
    "id" SERIAL NOT NULL,
    "chaveCTe" TEXT NOT NULL,
    "valorFrete" DOUBLE PRECISION NOT NULL,
    "placaVeiculo" TEXT NOT NULL,
    "previsaoEntrega" TIMESTAMP(3) NOT NULL,
    "motoristaId" INTEGER NOT NULL,
    "remetenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "recebedorId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ctes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motorista_ssw" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,

    CONSTRAINT "Motorista_ssw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remetente" (
    "id" SERIAL NOT NULL,
    "cnpjCPF" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Remetente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destinatario" (
    "id" SERIAL NOT NULL,
    "cnpjCPF" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Destinatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recebedor" (
    "id" SERIAL NOT NULL,
    "cnpjCPF" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cep" INTEGER NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "foneContato" TEXT NOT NULL,

    CONSTRAINT "Recebedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEnvio" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "StatusEnvio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_placa_key" ON "Motorista"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Ctes_chaveCTe_key" ON "Ctes"("chaveCTe");

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_ssw_cpf_key" ON "Motorista_ssw"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Remetente_cnpjCPF_key" ON "Remetente"("cnpjCPF");

-- CreateIndex
CREATE UNIQUE INDEX "Destinatario_cnpjCPF_key" ON "Destinatario"("cnpjCPF");

-- CreateIndex
CREATE UNIQUE INDEX "Recebedor_cnpjCPF_key" ON "Recebedor"("cnpjCPF");

-- CreateIndex
CREATE UNIQUE INDEX "StatusEnvio_status_key" ON "StatusEnvio"("status");

-- AddForeignKey
ALTER TABLE "Ctes" ADD CONSTRAINT "Ctes_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista_ssw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ctes" ADD CONSTRAINT "Ctes_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "Remetente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ctes" ADD CONSTRAINT "Ctes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Destinatario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ctes" ADD CONSTRAINT "Ctes_recebedorId_fkey" FOREIGN KEY ("recebedorId") REFERENCES "Recebedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ctes" ADD CONSTRAINT "Ctes_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "StatusEnvio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
