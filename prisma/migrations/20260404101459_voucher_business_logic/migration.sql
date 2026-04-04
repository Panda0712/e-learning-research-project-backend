-- AlterTable
ALTER TABLE `BlogPost` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    MODIFY `reviewNote` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Coupon` ADD COLUMN `scope` VARCHAR(191) NOT NULL DEFAULT 'ALL_COURSES',
    ADD COLUMN `scopeCategoryId` INTEGER NULL,
    ADD COLUMN `usagePerUser` INTEGER NULL,
    ADD COLUMN `usedCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` VARCHAR(191) NULL DEFAULT 'active',
    MODIFY `discountUnit` VARCHAR(191) NULL DEFAULT 'percent';

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `couponCode` VARCHAR(191) NULL,
    ADD COLUMN `couponId` INTEGER NULL,
    ADD COLUMN `discountAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `originalPrice` DOUBLE NULL;

-- CreateTable
CREATE TABLE `CouponUsage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `couponId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CouponUsage_orderId_key`(`orderId`),
    INDEX `CouponUsage_couponId_idx`(`couponId`),
    INDEX `CouponUsage_userId_couponId_idx`(`userId`, `couponId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
