export const linkTypes = [
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

export type LinkType = (typeof linkTypes)[number];
