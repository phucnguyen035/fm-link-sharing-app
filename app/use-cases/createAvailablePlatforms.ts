import { PLATFORMS, type Platform } from '~/constants';
import { type Link } from '~/models/link';

export function runCreateAvailablePlatformsUseCase() {
	return async function (links: Link[]) {
		const existingPlatform = new Set(links.map((link) => link.platform));

		return PLATFORMS.map((platform) => ({
			value: platform,
			label: getPlatformLabel(platform),
			disabled: existingPlatform.has(platform),
		}));
	};
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
