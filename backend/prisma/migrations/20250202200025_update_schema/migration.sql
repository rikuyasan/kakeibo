-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` VARCHAR(20) NULL,
    `name` VARCHAR(1000) NULL,
    `payment` INTEGER NULL,
    `category` VARCHAR(10) NULL,
    `paymentMethod` VARCHAR(50) NOT NULL,
    `yearMonth` VARCHAR(6) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
