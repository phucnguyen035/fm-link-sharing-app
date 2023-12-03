export function isUniqueConstraintError(error: unknown): error is Error {
	return error instanceof Error && error.message.includes('UNIQUE constraint failed');
}
