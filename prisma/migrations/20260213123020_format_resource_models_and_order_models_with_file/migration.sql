/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `LecturerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `LecturerResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonResource` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[thumbnailId]` on the table `BlogPost` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[thumbnailId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lecturerFileId]` on the table `LecturerProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonFileId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonVideoId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[avatarId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `LecturerResource` DROP FOREIGN KEY `LecturerResource_lecturerId_fkey`;

-- DropForeignKey
ALTER TABLE `LecturerResource` DROP FOREIGN KEY `LecturerResource_resourceId_fkey`;

-- DropForeignKey
ALTER TABLE `LessonResource` DROP FOREIGN KEY `LessonResource_lessonId_fkey`;

-- DropForeignKey
ALTER TABLE `LessonResource` DROP FOREIGN KEY `LessonResource_resourceId_fkey`;

-- AlterTable
ALTER TABLE `BlogPost` DROP COLUMN `thumbnail`,
    ADD COLUMN `thumbnailId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Course` DROP COLUMN `thumbnail`,
    ADD COLUMN `thumbnailId` INTEGER NULL;

-- AlterTable
ALTER TABLE `LecturerProfile` DROP COLUMN `resourceId`,
    ADD COLUMN `lecturerFileId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Lesson` DROP COLUMN `resourceId`,
    DROP COLUMN `videoUrl`,
    ADD COLUMN `lessonFileId` INTEGER NULL,
    ADD COLUMN `lessonVideoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Resource` ADD COLUMN `publicId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `avatar`,
    ADD COLUMN `avatarId` INTEGER NULL;

-- DropTable
DROP TABLE `LecturerResource`;

-- DropTable
DROP TABLE `LessonResource`;

-- CreateIndex
CREATE UNIQUE INDEX `BlogPost_thumbnailId_key` ON `BlogPost`(`thumbnailId`);

-- CreateIndex
CREATE UNIQUE INDEX `Course_thumbnailId_key` ON `Course`(`thumbnailId`);

-- CreateIndex
CREATE UNIQUE INDEX `LecturerProfile_lecturerFileId_key` ON `LecturerProfile`(`lecturerFileId`);

-- CreateIndex
CREATE UNIQUE INDEX `Lesson_lessonFileId_key` ON `Lesson`(`lessonFileId`);

-- CreateIndex
CREATE UNIQUE INDEX `Lesson_lessonVideoId_key` ON `Lesson`(`lessonVideoId`);

-- CreateIndex
CREATE UNIQUE INDEX `Resource_publicId_key` ON `Resource`(`publicId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_avatarId_key` ON `User`(`avatarId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_avatarId_fkey` FOREIGN KEY (`avatarId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_thumbnailId_fkey` FOREIGN KEY (`thumbnailId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_lessonFileId_fkey` FOREIGN KEY (`lessonFileId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_lessonVideoId_fkey` FOREIGN KEY (`lessonVideoId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_thumbnailId_fkey` FOREIGN KEY (`thumbnailId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LecturerProfile` ADD CONSTRAINT `LecturerProfile_lecturerFileId_fkey` FOREIGN KEY (`lecturerFileId`) REFERENCES `Resource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
