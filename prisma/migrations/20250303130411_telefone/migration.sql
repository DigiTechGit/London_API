-- AlterTable
ALTER TABLE "Recebedor" ADD COLUMN     "celularContato" TEXT;

-- CreateTable
CREATE TABLE "Historico" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "codigoEntidade" INTEGER NOT NULL,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);
