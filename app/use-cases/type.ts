import { type ZodFormattedError } from 'zod';

export type UseCaseResult<T> =
	| { success: true; data: T }
	| { success: false; errors: ZodFormattedError<T> };
