import dotenv from 'dotenv';
dotenv.config();

/** @type {import('drizzle-kit').Config} */
export default {
	driver: 'd1',
	schema: './app/repo/schema.ts',
	out: './drizzle',
	dbCredentials: {
		wranglerConfigPath: './wrangler.toml',
		dbName: 'fm_link_sharing',
	},
};
