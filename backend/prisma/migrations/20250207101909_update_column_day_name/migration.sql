/*
  Warnings:

  - You are about to alter the column `name` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1000)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `Payment` MODIFY `day` VARCHAR(10) NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL;
