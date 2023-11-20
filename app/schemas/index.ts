import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

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

export const links = sqliteTable('links', {
	id: integer('id').primaryKey(),
	url: text('url').notNull(),
	type: text('name', {
		enum: [
			'github',
			'twitter',
			'frontendmentor',
			'linkedin',
			'youtube',
			'facebook',
			'twitch',
			'devto',
			'codewars',
			'codepen',
			'freecodecamp',
			'gitlab',
			'hashnode',
			'stackoverflow',
		],
	}).notNull(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const linkRelations = relations(links, ({ one }) => ({
	user: one(users, { fields: [links.userId], references: [users.id] }),
}));
