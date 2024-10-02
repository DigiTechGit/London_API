/*
  Warnings:

  - You are about to drop the `TpEntidade` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `tp` on table `log` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_tp_fkey";

-- AlterTable
ALTER TABLE "log" ALTER COLUMN "tp" SET NOT NULL;

-- DropTable
DROP TABLE "TpEntidade";
