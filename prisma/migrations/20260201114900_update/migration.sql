-- AlterTable
ALTER TABLE `BlogComment` ADD COLUMN `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `BlogComment` ADD CONSTRAINT `BlogComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `BlogComment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
