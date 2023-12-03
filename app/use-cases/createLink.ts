import { z } from 'zod';
import { PLATFORMS } from '~/constants';
import { type Repository } from '~/repo';
import type { UseCaseResult } from './type';
import type { Link } from '~/models/link';

export const createLinkRequestSchema = z.object({
	platform: z.enum(PLATFORMS),
	url: z.string().url(),
});

export function runCreateLinkUseCase(linkRepo: Repository['links']) {
	return async function (
		userId: number,
		data: z.infer<typeof createLinkRequestSchema>,
	): Promise<UseCaseResult<Link>> {
		if (await linkRepo.exists(userId, data.platform)) {
			return {
				success: false,
				errors: {
					_errors: [],
					platform: { _errors: ['Platform already exists'] },
				},
			};
		}

		return {
			success: true,
			data: await linkRepo.create({ userId, ...data }),
		};
	};
}
