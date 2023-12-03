import { json, redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, Link, useActionData } from '@remix-run/react';
import { LockIcon, MailIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { validateFormSchema } from '~/lib/validate';
import { loginRequestSchema, runLoginCase } from '~/use-cases/login';

export function meta() {
	return [{ title: 'Login' }, { name: 'description', content: 'Login to Link Sharing App' }];
}

export async function loader({ request, context }: ActionFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));
	if (session.has('userId')) {
		return redirect('/');
	}

	return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));
	const formData = await request.formData();
	const validateResult = await validateFormSchema(loginRequestSchema, formData);
	if (!validateResult.success) {
		return json({ errors: validateResult.errors }, { status: 400 });
	}

	const loginResult = await runLoginCase(context.repo.users)(
		validateResult.data.email,
		validateResult.data.password,
	);
	if (!loginResult.success) {
		return json({ errors: loginResult.errors }, { status: 400 });
	}

	session.set('userId', loginResult.data.id);

	return redirect('/', {
		headers: {
			'set-cookie': await context.sessions.commitSession(session),
		},
	});
}

export default function LoginPage() {
	const data = useActionData<typeof action>();

	return (
		<Form method="POST">
			<Card className="h-screen rounded-sm md:h-full">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>Add your details below to get back into the app</CardDescription>
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
							error={!!data?.errors}
						/>
						{data && 'email' in data.errors && (
							<span className="text-xs text-destructive">{data.errors.email?._errors.at(0)}</span>
						)}
					</div>
					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							required
							id="password"
							type="password"
							placeholder="Enter your password"
							name="password"
							icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
							error={!!data?.errors}
						/>
						{data && 'password' in data.errors && (
							<span className="text-xs text-destructive">
								{data.errors.password?._errors.at(0)}
							</span>
						)}
					</div>
					{!!data?.errors && (
						<span className="text-xs font-semibold text-destructive">
							{data.errors._errors.at(0)}
						</span>
					)}
					<Button type="submit" className="w-full">
						Login
					</Button>
					<p className="text-center">
						Don't have an account?{' '}
						<Link to="/register" className="block text-primary md:inline">
							Create account
						</Link>
					</p>
				</CardContent>
			</Card>
		</Form>
	);
}
