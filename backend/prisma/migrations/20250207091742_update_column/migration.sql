/*
  Warnings:

  - You are about to alter the column `yearMonth` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(6)` to `Int`.
  - Made the column `day` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payment` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Payment` MODIFY `day` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(1000) NOT NULL,
    MODIFY `payment` INTEGER NOT NULL,
    MODIFY `category` VARCHAR(10) NOT NULL,
    MODIFY `yearMonth` INTEGER NOT NULL;
