import { eq } from 'drizzle-orm';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { type Platform } from '~/constants';
import * as schema from './schema';

export type Repository = {
	users: {
		create(email: string, password: string): Promise<number>;
		findCredentialsByEmail: (
			email: string,
		) => Promise<{ id: number; password: string } | undefined>;
	};
	links: {
		getByUserId(userId: number): Promise<Array<{ id: number; url: string; platform: Platform }>>;
		create(data: {
			userId: number;
			url: string;
			platform: Platform;
		}): Promise<{ id: number; url: string; platform: Platform }>;
	};
};

export function createRepository(d1: D1Database): Repository {
	const db = drizzle(d1, { logger: process.env.NODE_ENV === 'development', schema });

	return {
		users: createUserRepo(db),
		links: createLinkRepo(db),
	};
}

type Database = DrizzleD1Database<typeof schema>;

function createUserRepo(db: Database): Repository['users'] {
	const { users } = schema;

	return {
		async create(email, password) {
			const [user] = await db.insert(users).values({ email, password }).returning({ id: users.id });
			return user.id;
		},
		async findCredentialsByEmail(email) {
			const userCredentials = await db
				.select({ id: users.id, password: users.password })
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			return userCredentials.at(0);
		},
	};
}

function createLinkRepo(db: Database): Repository['links'] {
	const { links } = schema;

	return {
		async getByUserId(userId) {
			return await db
				.select({
					id: links.id,
					url: links.url,
					platform: links.platform,
				})
				.from(links)
				.where(eq(links.userId, userId));
		},
		async create(data) {
			const [link] = await db
				.insert(links)
				.values(data)
				.returning({ id: links.id, url: links.url, platform: links.platform });

			return link;
		},
	};
}
