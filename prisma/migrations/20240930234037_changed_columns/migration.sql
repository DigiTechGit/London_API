-- AlterTable
ALTER TABLE "Destinatario" ALTER COLUMN "tipo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Recebedor" ALTER COLUMN "tipo" DROP NOT NULL,
ALTER COLUMN "foneContato" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Remetente" ALTER COLUMN "tipo" DROP NOT NULL;
