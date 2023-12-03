import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
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
import { PLATFORMS, type Platform } from '~/constants';
import { requireUserId } from '~/session.server';
import { isUniqueConstraintError } from '~/lib/error';

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
	const links = await context.repo.links.getByUserId(userId);

	const availablePlatforms = PLATFORMS.map((platform) => ({
		value: platform,
		label: getPlatformLabel(platform),
		disabled: links.some((link) => link.platform === platform),
	}));

	return json({ links: await context.repo.links.getByUserId(userId), availablePlatforms });
}

export async function action({ request, context }: ActionFunctionArgs) {
	const [userId, formData] = await Promise.all([
		requireUserId(request, context.sessions),
		request.formData(),
	]);
	const schema = z.object({
		platform: z.enum(PLATFORMS),
		url: z.string().url(),
	});

	const result = await schema.spa(Object.fromEntries(formData));
	if (!result.success) {
		return json({ errors: result.error.flatten() }, { status: 400 });
	}

	try {
		await context.repo.links.create({
			userId,
			platform: result.data.platform,
			url: result.data.url,
		});

		return null;
	} catch (error) {
		type ErrResponse = z.typeToFlattenedError<z.infer<typeof schema>>;
		const errors: ErrResponse = {
			fieldErrors: {},
			formErrors: [],
		};

		if (isUniqueConstraintError(error)) {
			errors.formErrors.push('Platform link already exists.');
			return json({ errors }, { status: 400 });
		}

		errors.formErrors.push('Something went wrong. Please try again.');
		return json({ errors }, { status: 500 });
	}
}

export default function Index() {
	const { links, availablePlatforms } = useLoaderData<typeof loader>();
	const data = useActionData<typeof action>();

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
				{data?.errors?.formErrors && (
					<p className="text-xs font-medium text-red-500">{data.errors.formErrors[0]}</p>
				)}
				<Button>Submit</Button>
			</Form>
		</main>
	);
}

function getPlatformLabel(platform: Platform) {
	switch (platform) {
		case 'github':
			return 'GitHub';
		case 'gitlab':
			return 'GitLab';
		case 'devto':
			return 'Dev.to';
		case 'hashnode':
			return 'Hashnode';
		case 'twitch':
			return 'Twitch';
		case 'youtube':
			return 'YouTube';
		case 'facebook':
			return 'Facebook';
		case 'twitter':
			return 'Twitter';
		case 'linkedin':
			return 'LinkedIn';
		case 'codepen':
			return 'CodePen';
		case 'codewars':
			return 'CodeWars';
		case 'freecodecamp':
			return 'FreeCodeCamp';
		case 'frontendmentor':
			return 'Frontend Mentor';
		case 'stackoverflow':
			return 'Stack Overflow';
		default:
			const value: never = platform;
			throw new Error(`Unexpected value: ${value}`);
	}
}
