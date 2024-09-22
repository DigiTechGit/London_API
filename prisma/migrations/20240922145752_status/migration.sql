/*
  Warnings:

  - Added the required column `statusId` to the `Ctes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Ctes` ADD COLUMN `statusId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `StatusEnvio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `StatusEnvio_status_key`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ctes` ADD CONSTRAINT `Ctes_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `StatusEnvio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
