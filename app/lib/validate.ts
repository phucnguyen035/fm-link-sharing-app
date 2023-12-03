import { type ZodFormattedError, type ZodType } from 'zod';

type ValidateResult<T> =
	| { success: true; data: T }
	| { success: false; errors: ZodFormattedError<T> };

export async function validateFormSchema<T>(
	schema: ZodType<T>,
	formData: FormData,
): Promise<ValidateResult<T>> {
	const data = Object.fromEntries(formData.entries());
	const result = await schema.spa(data);
	if (!result.success) {
		return {
			success: false,
			errors: result.error.format(),
		};
	}

	return {
		success: true,
		data: result.data,
	};
}
