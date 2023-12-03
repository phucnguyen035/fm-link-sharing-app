import { hash } from 'bcryptjs';
import { z } from 'zod';
import { type Repository } from '~/repo';
import { type UseCaseResult } from './type';

export const MIN_PASSWORD_LENGTH = 8;
export const registerRequestSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(MIN_PASSWORD_LENGTH),
		confirmPassword: z.string().min(MIN_PASSWORD_LENGTH),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match',
	});

export function runRegisterUseCase(userRepo: Repository['users']) {
	return async function run(
		email: string,
		password: string,
	): Promise<UseCaseResult<{ id: number }>> {
		try {
			const id = await userRepo.create(email, await hash(password, 8));
			return {
				success: true,
				data: { id },
			};
		} catch {
			return {
				success: false,
				errors: {
					_errors: ['Invalid credentials'],
				},
			};
		}
	};
}
