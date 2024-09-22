-- CreateTable
CREATE TABLE `Ctes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chaveCTe` VARCHAR(191) NOT NULL,
    `valorFrete` DOUBLE NOT NULL,
    `placaVeiculo` VARCHAR(191) NOT NULL,
    `previsaoEntrega` DATETIME(3) NOT NULL,
    `motoristaId` INTEGER NOT NULL,
    `remetenteId` INTEGER NOT NULL,
    `destinatarioId` INTEGER NOT NULL,
    `recebedorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Ctes_chaveCTe_key`(`chaveCTe`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Motorista_ssw` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Motorista_ssw_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Remetente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpjCPF` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Remetente_cnpjCPF_key`(`cnpjCPF`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destinatario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpjCPF` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Destinatario_cnpjCPF_key`(`cnpjCPF`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recebedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpjCPF` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cep` INTEGER NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `uf` VARCHAR(191) NOT NULL,
    `foneContato` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Recebedor_cnpjCPF_key`(`cnpjCPF`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ctes` ADD CONSTRAINT `Ctes_motoristaId_fkey` FOREIGN KEY (`motoristaId`) REFERENCES `Motorista_ssw`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ctes` ADD CONSTRAINT `Ctes_remetenteId_fkey` FOREIGN KEY (`remetenteId`) REFERENCES `Remetente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ctes` ADD CONSTRAINT `Ctes_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `Destinatario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ctes` ADD CONSTRAINT `Ctes_recebedorId_fkey` FOREIGN KEY (`recebedorId`) REFERENCES `Recebedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
