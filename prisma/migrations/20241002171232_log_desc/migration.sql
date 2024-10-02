/*
  Warnings:

  - Added the required column `desc` to the `log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "log" ADD COLUMN     "desc" TEXT NOT NULL;
