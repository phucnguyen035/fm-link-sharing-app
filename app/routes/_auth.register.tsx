import { json, redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, Link, useActionData } from '@remix-run/react';
import { LockIcon, MailIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

const MIN_PASSWORD_LENGTH = 8;

export async function action({ request, context }: ActionFunctionArgs) {
	const { sessions, repo } = context;
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
		.refine((data) => data.password === data.confirmPassword, {
			path: ['confirmPassword'],
			message: 'Passwords do not match',
		})
		.refine(async ({ email }) => {
			const userExists = await repo.users.exists(email);
			return !userExists;
		}, 'Failed to sign up');

	const result = await schema.spa(Object.fromEntries(formData));
	if (!result.success) {
		return json({ errors: result.error.flatten() }, { status: 400 });
	}

	session.set('userId', await repo.users.create(result.data));

	return redirect('/', {
		headers: {
			'set-cookie': await sessions.commitSession(session),
		},
	});
}

export default function RegisterPage() {
	const data = useActionData<typeof action>();
	const hasFormErrors = !!data?.errors?.formErrors.length;

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
							error={data?.errors.fieldErrors.email || hasFormErrors}
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
							error={data?.errors.fieldErrors.password || hasFormErrors}
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
							error={data?.errors.fieldErrors.confirmPassword || hasFormErrors}
						/>
						{data?.errors.fieldErrors.confirmPassword && (
							<span className="text-xs text-destructive">
								{data.errors.fieldErrors.confirmPassword?.[0]}
							</span>
						)}
					</div>
					{hasFormErrors && (
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
