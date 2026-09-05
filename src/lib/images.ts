export const imageIds = [
	'skorovas-village-from-above',
	'skorovas-camping-pitches',
	'skorovas-shop',
	'gruvekafeen',
	'skjenkestova',
	'skorovatn-chapel',
	'skorovas-winter-landscape',
	'trim-og-trivsel',
	'skorovasmarsjen'
] as const;

export type ImageId = (typeof imageIds)[number];

const modules = import.meta.glob('/src/lib/assets/content/*.jpeg', {
	eager: true,
	query: { enhanced: true },
	import: 'default'
}) as Record<string, Picture>;

const urlModules = import.meta.glob('/src/lib/assets/content/*.jpeg', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

export function getEnhancedImage(id: string): Picture {
	const match = Object.entries(modules).find(([path]) => path.endsWith(`/${id}.jpeg`));
	if (!match) throw new Error(`Unknown image: ${id}`);
	return match[1];
}

export function getImageUrl(id: string): string {
	const match = Object.entries(urlModules).find(([path]) => path.endsWith(`/${id}.jpeg`));
	if (!match) throw new Error(`Unknown image: ${id}`);
	return match[1];
}
import type { Picture } from '@sveltejs/enhanced-img';
