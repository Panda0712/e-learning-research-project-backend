/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX `Wishlist_userId_createdAt_idx` ON `Wishlist`(`userId`, `createdAt` DESC);

-- CreateIndex
CREATE UNIQUE INDEX `Wishlist_userId_courseId_key` ON `Wishlist`(`userId`, `courseId`);

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
