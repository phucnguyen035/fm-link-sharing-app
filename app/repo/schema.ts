import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { PLATFORMS } from '~/constants';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	email: text('email').notNull().unique(),
	firstName: text('first_name').default(''),
	lastName: text('last_name').default(''),
	profilePicture: text('profile_picture').default(''),
	password: text('password').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const links = sqliteTable(
	'links',
	{
		id: integer('id').primaryKey(),
		url: text('url').notNull(),
		platform: text('platform', { enum: PLATFORMS }).notNull(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => ({
		uniqueUserPlatform: unique().on(t.platform, t.userId),
	}),
);

export const linkRelations = relations(links, ({ one }) => ({
	user: one(users, { fields: [links.userId], references: [users.id] }),
}));
