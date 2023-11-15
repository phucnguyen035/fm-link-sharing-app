import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";

export function meta() {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get("password")?.toString() ?? "";
  if (!password) {
    throw new Error("Password is required");
  }

  return await bcrypt.hash(password, 10);
}

export default function Index() {
  const hashed = useActionData<typeof action>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <Form method="post">
        <input type="email" placeholder="john.smith@example.com" name="email" />
        <input type="password" name="password" />
        <button>Sign up</button>
      </Form>
      {hashed && <p>{hashed}</p>}
    </div>
  );
}
