import { login } from "@/services/auth.service";
import { createUser, hasExistingUser } from "@/services/user.service";
import { validateFormData } from "@/utils/validateFormData";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import RegisterForm from "./RegisterForm";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function register(_prevState: unknown, formData: FormData) {
  "use server";

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
  await cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/");
}

export default function RegisterPage() {
  return <RegisterForm action={register} />;
}
