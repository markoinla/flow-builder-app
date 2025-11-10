PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flows` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_flows`("id", "user_id", "name", "description", "created_at", "updated_at") SELECT "id", "user_id", "name", "description", "created_at", "updated_at" FROM `flows`;--> statement-breakpoint
DROP TABLE `flows`;--> statement-breakpoint
ALTER TABLE `__new_flows` RENAME TO `flows`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_node_types` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`style` text,
	`icon_style` text,
	`handles` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_node_types`("id", "user_id", "name", "type", "style", "icon_style", "handles", "created_at", "updated_at") SELECT "id", "user_id", "name", "type", "style", "icon_style", "handles", "created_at", "updated_at" FROM `node_types`;--> statement-breakpoint
DROP TABLE `node_types`;--> statement-breakpoint
ALTER TABLE `__new_node_types` RENAME TO `node_types`;