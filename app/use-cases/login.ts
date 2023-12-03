import { compare } from 'bcryptjs';
import z from 'zod';
import { type Repository } from '~/repo';
import { type UseCaseResult } from './type';

export const loginRequestSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export function runLoginCase(userRepo: Repository['users']) {
	return async function run(
		email: string,
		password: string,
	): Promise<UseCaseResult<{ id: number }>> {
		const user = await userRepo.findCredentialsByEmail(email);
		const valid = await compare(password, user?.password ?? '');
		if (!valid || !user) {
			return {
				success: false,
				errors: {
					_errors: ['Invalid credentials'],
				},
			};
		}

		return {
			success: true,
			data: {
				id: user.id,
			},
		};
	};
}
