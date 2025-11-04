/*
  Warnings:

  - Added the required column `createdById` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Category` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Listing` MODIFY `expiresAt` DATETIME(3) NULL DEFAULT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordResetExpires` TIMESTAMP(6) NULL,
    ADD COLUMN `passwordResetToken` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
