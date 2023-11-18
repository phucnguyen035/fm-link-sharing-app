import { json, redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, Link, useActionData } from '@remix-run/react';
import { hash } from 'bcryptjs';
import { LockIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { users } from '~/schemas/users';

const MIN_PASSWORD_LENGTH = 8;

export async function action({ request, context }: ActionFunctionArgs) {
	const { db, sessions } = context;
	const session = await sessions.getSession(request.headers.get('Cookie'));
	if (session.has('userId')) {
		return redirect('/');
	}

	const formData = await request.formData();
	const schema = z
		.object({
			email: z.string().email(),
			password: z.string().min(MIN_PASSWORD_LENGTH),
			confirmPassword: z.string().min(MIN_PASSWORD_LENGTH),
		})
		.refine(async ({ email }) => {
			const user = await db.query.users.findFirst({
				columns: { id: true },
				where: (users, { eq }) => eq(users.email, email),
			});

			return !user;
		}, 'Failed to sign up');

	const result = await schema.spa(Object.fromEntries(formData));
	if (!result.success) {
		return json({ errors: result.error.flatten() }, { status: 400 });
	}

	const hashedPassword = await hash(result.data.password, 8);
	const [{ id }] = await db
		.insert(users)
		.values({
			email: result.data.email,
			password: hashedPassword,
		})
		.returning({ id: users.id });

	session.set('userId', id);

	return redirect('/', {
		headers: {
			'set-cookie': await sessions.commitSession(session),
		},
	});
}

export default function RegisterPage() {
	const data = useActionData<typeof action>();

	return (
		<Form method="POST">
			<Card className="h-screen rounded-sm md:h-full">
				<CardHeader>
					<CardTitle>Create Account</CardTitle>
					<CardDescription>Let’s get you started sharing your links!</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-y-4">
					<div>
						<Label htmlFor="email">Email address</Label>
						<Input
							required
							id="email"
							type="email"
							placeholder="e.g. alex@email.com"
							name="email"
							icon={<MailIcon className="h-4 w-4 text-muted-foreground" />}
							error={data?.errors.fieldErrors.email || data?.errors.formErrors}
						/>
						{data?.errors.fieldErrors.email && (
							<span className="text-xs text-destructive">{data.errors.fieldErrors.email[0]}</span>
						)}
					</div>
					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							required
							minLength={MIN_PASSWORD_LENGTH}
							id="password"
							type="password"
							placeholder="At least 8 characters"
							name="password"
							icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
							error={data?.errors.fieldErrors.password || data?.errors.formErrors}
						/>
						{data?.errors.fieldErrors.password && (
							<span className="text-xs text-destructive">
								{data.errors.fieldErrors.password?.[0]}
							</span>
						)}
					</div>
					<div>
						<Label htmlFor="confirm-password">Confirm Password</Label>
						<Input
							required
							minLength={MIN_PASSWORD_LENGTH}
							id="confirm-password"
							type="password"
							placeholder="At least 8 characters"
							name="confirmPassword"
							icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
							error={data?.errors.fieldErrors.password || data?.errors.formErrors}
						/>
						{data?.errors.fieldErrors.password && (
							<span className="text-xs text-destructive">
								{data.errors.fieldErrors.password?.[0]}
							</span>
						)}
					</div>
					{data?.errors.formErrors && (
						<span className="text-xs text-destructive">{data.errors.formErrors[0]}</span>
					)}
					<Button type="submit" className="w-full">
						Sign up
					</Button>
					<p className="text-center">
						Already have an account?{' '}
						<Link to="/login" className="block text-primary md:inline">
							Login
						</Link>
					</p>
				</CardContent>
			</Card>
		</Form>
	);
}
