<script lang="ts">
	import ContentPage from '$lib/components/ContentPage.svelte';
	import { getContentDocument } from '$lib/content';
	const document = getContentDocument('home', 'nb');
	if (!document) throw new Error('Missing Norwegian home page');
</script>

<ContentPage {document} />
