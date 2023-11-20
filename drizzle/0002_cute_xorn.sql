ALTER TABLE `links` RENAME COLUMN `name` TO `type`;--> statement-breakpoint
CREATE UNIQUE INDEX `links_type_user_id_unique` ON `links` (`type`,`user_id`);