"use server";

import { login } from "@/services/auth.service";
import { createUser, hasExistingUser } from "@/services/user.service";
import { validateFormData } from "@/utils/validateFormData";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(_prevState: unknown, formData: FormData) {
  const result = validateFormData(formData, registerSchema);
  if (!result.success) {
    return { errors: result.errors };
  }

  if (await hasExistingUser(result.data.email)) {
    return {
      errors: {},
    };
  }

  const userId = await createUser(result.data.email, result.data.password);
  const sessionCookie = await login(userId);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
}
