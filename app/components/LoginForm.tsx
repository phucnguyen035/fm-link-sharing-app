import { Link } from '@remix-run/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { LockIcon, MailIcon } from 'lucide-react';

type Props = {
	errors?: {
		email?: string;
		password?: string;
	};
};

export default function LoginForm({ errors }: Props) {
	return (
		<Card className="mx-auto max-w-md rounded-sm">
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
						aria-invalid={errors?.email ? true : undefined}
					/>
					{errors?.email && <span className="text-xs text-destructive">{errors.email}</span>}
				</div>
				<div>
					<Label htmlFor="password">Password</Label>
					<Input
						required
						minLength={8}
						id="password"
						type="password"
						placeholder="Enter your password"
						name="password"
						icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
						error={errors?.password}
					/>
					{errors?.password && <span className="text-xs text-destructive">{errors.password}</span>}
				</div>
				<Button type="submit" className="w-full">
					Sign up
				</Button>
				<p className="text-center">
					Don't have an account?{' '}
					<Link to="/register" className="text-primary">
						Create account
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
