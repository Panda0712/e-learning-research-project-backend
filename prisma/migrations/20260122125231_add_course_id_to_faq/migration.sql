/*
  Warnings:

  - Added the required column `courseId` to the `CourseFAQ` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CourseFAQ` ADD COLUMN `courseId` INTEGER NOT NULL,
    MODIFY `question` TEXT NOT NULL,
    MODIFY `answer` TEXT NULL;

-- AddForeignKey
ALTER TABLE `CourseFAQ` ADD CONSTRAINT `CourseFAQ_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
