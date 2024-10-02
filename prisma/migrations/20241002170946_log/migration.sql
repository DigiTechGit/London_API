-- CreateTable
CREATE TABLE "log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tp" TEXT,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TpEntidade" (
    "id" SERIAL NOT NULL,
    "TpEntidade" TEXT NOT NULL,
    "desc" TEXT NOT NULL,

    CONSTRAINT "TpEntidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TpEntidade_TpEntidade_key" ON "TpEntidade"("TpEntidade");

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_tp_fkey" FOREIGN KEY ("tp") REFERENCES "TpEntidade"("TpEntidade") ON DELETE SET NULL ON UPDATE CASCADE;
