import { z } from "zod";

export function validateFormData<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
):
  | {
      success: true;
      data: z.infer<T>;
    }
  | {
      success: false;
      errors: z.inferFlattenedErrors<T>["fieldErrors"];
    } {
  const data = Object.fromEntries(formData.entries());
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
