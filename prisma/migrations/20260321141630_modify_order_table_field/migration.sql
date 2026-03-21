/*
  Warnings:

  - A unique constraint covering the columns `[paymentLinkId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `checkoutUrl` TEXT NULL,
    ADD COLUMN `isSuccess` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentLinkId` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` VARCHAR(191) NULL DEFAULT 'pending',
    ADD COLUMN `qrCode` TEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `paymentMethod` VARCHAR(191) NULL DEFAULT 'payos';

-- CreateIndex
CREATE UNIQUE INDEX `Order_paymentLinkId_key` ON `Order`(`paymentLinkId`);
