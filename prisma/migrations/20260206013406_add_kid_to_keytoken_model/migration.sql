/*
  Warnings:

  - Added the required column `kid` to the `KeyToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `KeyToken` ADD COLUMN `kid` VARCHAR(191) NOT NULL;
