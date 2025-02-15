/*
  Warnings:

  - You are about to drop the column `day` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `date` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `day`,
    ADD COLUMN `date` VARCHAR(10) NOT NULL;
