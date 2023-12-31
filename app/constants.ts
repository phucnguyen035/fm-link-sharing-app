export const PLATFORMS = [
	'github',
	'twitter',
	'frontendmentor',
	'linkedin',
	'youtube',
	'facebook',
	'twitch',
	'devto',
	'codewars',
	'codepen',
	'freecodecamp',
	'gitlab',
	'hashnode',
	'stackoverflow',
] as const;

export type Platform = (typeof PLATFORMS)[number];
