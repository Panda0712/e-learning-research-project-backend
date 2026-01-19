/*
  Warnings:

  - Added the required column `refreshTokenUsed` to the `KeyToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `KeyToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `KeyToken` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isDestroyed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `refreshTokenUsed` JSON NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `refreshToken` VARCHAR(191) NULL;
