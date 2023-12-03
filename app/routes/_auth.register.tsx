import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/cloudflare';
import { Form, Link, useActionData } from '@remix-run/react';
import { LockIcon, MailIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { validateFormSchema } from '~/lib/validate';
import {
	MIN_PASSWORD_LENGTH,
	registerRequestSchema,
	runRegisterUseCase,
} from '~/use-cases/register';

export async function loader({ request, context }: LoaderFunctionArgs) {
	const { sessions } = context;
	const session = await sessions.getSession(request.headers.get('Cookie'));
	if (session.has('userId')) {
		return redirect('/');
	}

	return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
	const session = await context.sessions.getSession(request.headers.get('Cookie'));
	const formData = await request.formData();
	const result = await validateFormSchema(registerRequestSchema, formData);
	if (!result.success) {
		return json({ errors: result.errors }, { status: 400 });
	}

	const registerResult = await runRegisterUseCase(context.repo.users)(
		result.data.email,
		result.data.password,
	);
	if (!registerResult.success) {
		return json({ errors: registerResult.errors }, { status: 400 });
	}

	session.set('userId', registerResult.data.id);

	return redirect('/', {
		headers: {
			'set-cookie': await context.sessions.commitSession(session),
		},
	});
}

export default function RegisterPage() {
	const data = useActionData<typeof action>();
	const hasFormErrors = !!data?.errors._errors.length;

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
							error={data && 'email' in data?.errors ? !!data.errors.email?._errors : hasFormErrors}
						/>
						{data && (
							<span className="text-xs text-destructive">
								{'email' in data.errors
									? data.errors.email?._errors.at(0)
									: data.errors._errors.at(0)}
							</span>
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
							error={
								data && 'password' in data?.errors ? !!data.errors.password?._errors : hasFormErrors
							}
						/>
						{data && (
							<span className="text-xs text-destructive">
								{'password' in data.errors
									? data.errors.password?._errors.at(0)
									: data.errors._errors.at(0)}
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
							error={
								data && 'confirmPassword' in data?.errors
									? !!data.errors.confirmPassword?._errors
									: hasFormErrors
							}
						/>
						{data && (
							<span className="text-xs text-destructive">
								{'confirmPassword' in data.errors
									? data.errors.confirmPassword?._errors.at(0)
									: data.errors._errors.at(0)}
							</span>
						)}
					</div>
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
