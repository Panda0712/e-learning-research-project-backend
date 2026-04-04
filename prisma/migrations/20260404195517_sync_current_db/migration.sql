-- AlterTable
ALTER TABLE `CourseReview` ADD COLUMN `lecturerReply` TEXT NULL,
    ADD COLUMN `lecturerReplyAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Wishlist_userId_fkey` ON `Wishlist`(`userId`);
