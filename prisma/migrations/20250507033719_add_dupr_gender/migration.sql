-- AlterTable
ALTER TABLE `Member` ADD COLUMN `dupr_alphanumeric` VARCHAR(191) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL;
