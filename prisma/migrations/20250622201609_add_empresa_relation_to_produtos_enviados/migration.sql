-- CreateTable
CREATE TABLE "ProdutosEnviados" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "motorista" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "idEntrega" TEXT NOT NULL,

    CONSTRAINT "ProdutosEnviados_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProdutosEnviados" ADD CONSTRAINT "ProdutosEnviados_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
