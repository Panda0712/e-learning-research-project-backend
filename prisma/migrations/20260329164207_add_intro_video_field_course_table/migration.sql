/*
  Warnings:

  - A unique constraint covering the columns `[introVideoId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `introVideoId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Course_introVideoId_key` ON `Course`(`introVideoId`);

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_introVideoId_fkey` FOREIGN KEY (`introVideoId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
