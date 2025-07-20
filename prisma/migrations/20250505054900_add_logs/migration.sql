-- CreateTable
CREATE TABLE `Log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `level` VARCHAR(191) NOT NULL DEFAULT 'ERROR',
    `message` TEXT NOT NULL,
    `stack` TEXT NULL,
    `path` VARCHAR(191) NULL,
    `function` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `extra` JSON NULL,

    INDEX `Log_timestamp_idx`(`timestamp`),
    INDEX `Log_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
