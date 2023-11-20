ALTER TABLE `links` RENAME COLUMN `type` TO `platform`;--> statement-breakpoint
DROP INDEX IF EXISTS `links_type_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `links_platform_user_id_unique` ON `links` (`platform`,`user_id`);