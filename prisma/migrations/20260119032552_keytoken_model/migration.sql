-- CreateTable
CREATE TABLE `KeyToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `publicKey` VARCHAR(191) NOT NULL,
    `privateKey` VARCHAR(191) NOT NULL,
    `refreshToken` JSON NOT NULL,

    UNIQUE INDEX `KeyToken_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KeyToken` ADD CONSTRAINT `KeyToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
