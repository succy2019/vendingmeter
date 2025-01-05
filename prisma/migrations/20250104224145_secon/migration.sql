/*
  Warnings:

  - Added the required column `accountName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `accountName` VARCHAR(191) NOT NULL,
    ADD COLUMN `accountNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `bankName` VARCHAR(191) NOT NULL;
