import { error } from '@sveltejs/kit';
import { getContentDocumentByPath, getNewsDocumentByPath, newsDocuments } from '$lib/content';
import { localizedRoutes, routeFromPath } from '$lib/i18n';

export const entries = () => [
	...localizedRoutes
		.filter((route) => route.path !== '/')
		.map((route) => ({ path: route.path.slice(1) })),
	...newsDocuments.map((document) => ({ path: document.path.slice(1) }))
];
export function load({ params }) {
	const path = `/${params.path ?? ''}`;
	if (!routeFromPath(path) && !getContentDocumentByPath(path) && !getNewsDocumentByPath(path))
		error(404, 'Not found');
	return { path };
}
