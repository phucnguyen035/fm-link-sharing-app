import { type Repository } from '~/repo';

export function runGetUserLinksUseCase(linksRepo: Repository['links']) {
	return async function (userId: number) {
		return await linksRepo.getByUserId(userId);
	};
}
