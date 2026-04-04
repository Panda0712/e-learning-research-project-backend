ALTER TABLE `BlogPost`
  ADD COLUMN `reviewedById` INTEGER NULL,
  ADD COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'draft',
  ADD COLUMN `reviewNote` TEXT NULL,
  ADD COLUMN `publishedAt` DATETIME(3) NULL;

UPDATE `BlogPost`
SET `status` = 'published', `publishedAt` = COALESCE(`publishedAt`, `createdAt`)
WHERE `isDestroyed` = false;

CREATE INDEX `BlogPost_reviewedById_idx` ON `BlogPost`(`reviewedById`);

ALTER TABLE `BlogPost`
  ADD CONSTRAINT `BlogPost_reviewedById_fkey`
  FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
