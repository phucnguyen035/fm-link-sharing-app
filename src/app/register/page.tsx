"use client";

import { useFormState, useFormStatus } from "react-dom";
import { register } from "./actions";

export default function RegisterPage() {
  const [{ errors }, dispatch] = useFormState(register, {
    errors: {},
  });

  return (
    <div>
      <h1>Register</h1>

      <form noValidate action={dispatch}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
          {errors?.email && (
            <div className="text-red-500">{errors.email[0]}</div>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />
          {errors?.password && (
            <div className="text-red-500">{errors.password[0]}</div>
          )}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Loading" : "Register"}
    </button>
  );
}
