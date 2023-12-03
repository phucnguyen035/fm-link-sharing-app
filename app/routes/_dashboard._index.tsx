import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import { requireUserId } from '~/session.server';
import { runGetUserLinksUseCase } from '~/use-cases/getUserLinks';
import { runCreateAvailablePlatformsUseCase } from '~/use-cases/createAvailablePlatforms';
import { validateFormSchema } from '~/lib/validate';
import { createLinkRequestSchema, runCreateLinkUseCase } from '~/use-cases/createLink';

export function meta() {
	return [
		{ title: 'Link Sharing App [FM]' },
		{
			name: 'description',
			content: 'Welcome to Link Sharing App, a project from Frontend Mentor!',
		},
	];
}

export async function loader({ context, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, context.sessions);
	const links = await runGetUserLinksUseCase(context.repo.links)(userId);
	const availablePlatforms = await runCreateAvailablePlatformsUseCase()(links);

	return json({ links, availablePlatforms });
}

export async function action({ request, context }: ActionFunctionArgs) {
	const [userId, formData] = await Promise.all([
		requireUserId(request, context.sessions),
		request.formData(),
	]);

	const validateResult = await validateFormSchema(createLinkRequestSchema, formData);
	if (!validateResult.success) {
		return json({ errors: validateResult.errors }, { status: 400 });
	}

	const createLinkResult = await runCreateLinkUseCase(context.repo.links)(
		userId,
		validateResult.data,
	);
	if (!createLinkResult.success) {
		return json({ errors: createLinkResult.errors }, { status: 400 });
	}

	return json({ success: true }, { status: 201 });
}

export default function Index() {
	const { links, availablePlatforms } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	function hasActionError(
		data: typeof actionData,
	): data is Extract<typeof actionData, { errors: { _errors: string[] } }> {
		if (!actionData) {
			return false;
		}

		return 'errors' in actionData;
	}

	return (
		<main>
			{links.length > 0 ? (
				<ul>
					{links.map((link) => (
						<li key={link.id}>
							<a href={link.url}>{link.platform}</a>
						</li>
					))}
				</ul>
			) : (
				<p>No links yet.</p>
			)}

			<Form method="POST" className="mx-auto grid max-w-xs gap-y-4">
				<div>
					<Label>Platform</Label>
					<Select name="platform">
						<SelectTrigger>
							<SelectValue placeholder="Select a platform" />
						</SelectTrigger>
						<SelectContent>
							{availablePlatforms.map((platform) => (
								<SelectItem
									key={platform.value}
									value={platform.value}
									disabled={platform.disabled}
								>
									{platform.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{hasActionError(actionData) && actionData.errors.platform && (
						<span className="text-xs font-semibold text-destructive">
							{actionData.errors.platform._errors.at(0)}
						</span>
					)}
				</div>
				<div>
					<Label>URL</Label>
					<Input
						required
						type="url"
						name="url"
						placeholder="e.g. https://github.com/phucnguyen035"
					/>
				</div>
				{hasActionError(actionData) && (
					<p className="text-xs font-medium text-red-500">{actionData.errors._errors.at(0)}</p>
				)}
				<Button>Submit</Button>
			</Form>
		</main>
	);
}
