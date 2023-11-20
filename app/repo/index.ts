import { compare, hash } from 'bcryptjs';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { type LinkType } from '~/constants';
import * as schema from './schema';

export type Repository = {
	users: {
		exists(email: string): Promise<boolean>;
		create(user: { email: string; password: string }): Promise<number>;
		verify(user: { email: string; password: string }): Promise<number | undefined>;
	};
	links: {
		get(userId: number): Promise<Array<{ id: number; url: string; type: LinkType }>>;
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
		async create({ email, password }: { email: string; password: string }) {
			const user = await db
				.insert(users)
				.values({ email, password: await hash(password, 8) })
				.returning({ id: users.id });

			return user[0].id;
		},
		async exists(email: string) {
			const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email));

			return user.length > 0;
		},
		async verify({ email, password }) {
			const [user] = await db
				.select({ id: users.id, password: users.password })
				.from(users)
				.where(eq(users.email, email))
				.limit(1);
			if (!user) {
				return;
			}

			const isPasswordValid = await compare(password, user.password);
			if (!isPasswordValid) {
				return;
			}

			return user.id;
		},
	};
}

function createLinkRepo(db: Database): Repository['links'] {
	const { links } = schema;

	return {
		async get(userId) {
			return await db
				.select({
					id: links.id,
					url: links.url,
					type: links.type,
				})
				.from(links)
				.where(eq(links.userId, userId));
		},
	};
}
