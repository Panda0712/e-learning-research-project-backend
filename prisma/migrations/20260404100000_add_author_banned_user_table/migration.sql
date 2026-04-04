-- Create AuthorBannedUser table if it does not exist
CREATE TABLE IF NOT EXISTS `AuthorBannedUser` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `authorId` INT NOT NULL,
  `userId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AuthorBannedUser_authorId_userId_key` (`authorId`, `userId`),
  CONSTRAINT `AuthorBannedUser_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `AuthorBannedUser_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
