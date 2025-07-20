-- CreateTable
CREATE TABLE `User` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `first_name` varchar(191) NOT NULL,
    `last_name` varchar(191) NOT NULL,
    `email` varchar(191) NOT NULL,
    `password` varchar(191) DEFAULT NULL,
    `token` varchar(191) DEFAULT NULL,
    `is_admin` tinyint(1) NOT NULL DEFAULT 0,
    `rol` varchar(191) NOT NULL DEFAULT 'user',
    PRIMARY KEY (`id`),
    UNIQUE KEY `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `birthday` datetime(3) DEFAULT NULL,
    `phone` varchar(191) DEFAULT NULL,
    `dupr` decimal(65, 30) DEFAULT 0.000000000000000000000000000000,
    `shirt_size` enum('S', 'M', 'L', 'XL', 'XXL') DEFAULT NULL,
    `phone_code` varchar(191) DEFAULT NULL,
    `phone_number` varchar(191) DEFAULT NULL,
    `passport` varchar(191) DEFAULT NULL,
    `country` varchar(191) DEFAULT NULL,
    `arrival` datetime(3) DEFAULT NULL,
    `airline` varchar(191) DEFAULT NULL,
    `flight` varchar(191) DEFAULT NULL,
    `info_completed` tinyint(1) NOT NULL DEFAULT 0,
    `is_coordinator` tinyint(1) NOT NULL DEFAULT 0,
    `country_code` varchar(191) DEFAULT NULL,
    `question1` text DEFAULT NULL,
    `question2` text DEFAULT NULL,
    `question3` text DEFAULT NULL,
    `country_en` varchar(191) DEFAULT NULL,
    `position` varchar(191) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `Member_user_id_key` (`user_id`),
    CONSTRAINT `Member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tournament` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(191) NOT NULL,
    `start` datetime(3) DEFAULT NULL,
    `end` datetime(3) DEFAULT NULL,
    `age_min` int(11) DEFAULT NULL,
    `age_max` int(11) DEFAULT NULL,
    `color` varchar(191) DEFAULT NULL,
    `players_min` int(11) DEFAULT NULL,
    `players_max` int(11) DEFAULT NULL,
    `dupr_max` decimal(65, 30) DEFAULT 0.000000000000000000000000000000,
    `amount` decimal(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    `active` tinyint(1) NOT NULL DEFAULT 1,
    `position` int(11) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `country_code` varchar(191) DEFAULT NULL,
    `coordinator_id` int(11) NOT NULL,
    `tournament_id` int(11) NOT NULL,
    `coach_id` int(11) DEFAULT NULL,
    `captain_id` int(11) DEFAULT NULL,
    `payment_token` varchar(191) DEFAULT NULL,
    `status` enum('CREATED', 'PAID') NOT NULL DEFAULT 'CREATED',
    `country` varchar(191) DEFAULT NULL,
    `country_en` varchar(191) DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `Team_coordinator_id_fkey`(`coordinator_id`)
    -- KEY `Team_tournament_id_fkey` (`tournament_id`),
    -- KEY `Team_coach_id_fkey` (`coach_id`),
    -- KEY `Team_captain_id_fkey` (`captain_id`),
    -- KEY `Team_coordinator_id_fkey` (`coordinator_id`),
    -- CONSTRAINT `Team_captain_id_fkey` FOREIGN KEY (`captain_id`) REFERENCES `Member` (`id`) ON DELETE
    -- SET
    --   NULL ON UPDATE CASCADE,
    --   CONSTRAINT `Team_coach_id_fkey` FOREIGN KEY (`coach_id`) REFERENCES `Member` (`id`) ON DELETE
    -- SET
    --   NULL ON UPDATE CASCADE,
    --   CONSTRAINT `Team_coordinator_id_fkey` FOREIGN KEY (`coordinator_id`) REFERENCES `Member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    --   CONSTRAINT `Team_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament` (`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_id` INTEGER NOT NULL,
    `member_id` INTEGER NOT NULL,

    INDEX `Player_member_id_fkey`(`member_id`),
    UNIQUE INDEX `Player_team_id_member_id_key`(`team_id`, `member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE `Event` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(191) NOT NULL,
    `code` varchar(191) NOT NULL,
    `description` text DEFAULT NULL,
    `amount` decimal(65, 30) NOT NULL,
    `limit` int(11) NOT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `position` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `Event_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EventPayment` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `event_id` int(11) NOT NULL,
    `name` varchar(191) NOT NULL,
    `lastname` varchar(191) NOT NULL,
    `email` varchar(191) NOT NULL,
    `country_code` varchar(191) NOT NULL,
    `country` varchar(191) NOT NULL,
    `phone` varchar(191) NOT NULL,
    `passport` varchar(191) NOT NULL,
    `payment_intent` varchar(191) NOT NULL,
    `concept` varchar(191) NOT NULL,
    `status` enum('APPROVED', 'REJECTED', 'PENDING', 'REFOUND') NOT NULL,
    `created` datetime(3) NOT NULL DEFAULT current_timestamp(3),
    `modified` datetime(3) NOT NULL,
    `amount` decimal(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    PRIMARY KEY (`id`),
    KEY `EventPayment_event_id_fkey` (`event_id`),
    CONSTRAINT `EventPayment_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event` (`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `team_id` int(11) NOT NULL,
    `concept` enum('RESERVE', 'REGISTER') NOT NULL,
    `amount` decimal(65, 30) NOT NULL,
    `response` text DEFAULT NULL,
    `status` enum('APPROVED', 'REJECTED', 'PENDING', 'REFOUND') NOT NULL,
    `payment_intent` varchar(191) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `Payment_team_id_fkey` (`team_id`),
    CONSTRAINT `Payment_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Reserve` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `team_id` int(11) NOT NULL,
    `payment_id` int(11) NOT NULL,
    `start` datetime(3) NOT NULL,
    `end` datetime(3) NOT NULL,
    `qty` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `Reserve_team_id_key` (`team_id`),
    UNIQUE KEY `Reserve_payment_id_key` (`payment_id`),
    CONSTRAINT `Reserve_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Reserve_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Support` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `team_id` int(11) NOT NULL,
    `member_id` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `Support_team_id_member_id_key` (`team_id`, `member_id`),
    KEY `Support_member_id_fkey` (`member_id`),
    CONSTRAINT `Support_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `Member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Support_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
-- ALTER TABLE `Member` ADD CONSTRAINT `Member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_coordinator_id_fkey` FOREIGN KEY (`coordinator_id`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_coach_id_fkey` FOREIGN KEY (`coach_id`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_captain_id_fkey` FOREIGN KEY (`captain_id`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
