import type { Locale } from '$lib/i18n';

export const photoGroups = {
	camping: {
		nb: 'Camping og nærområdet',
		en: 'Camping and surroundings',
		de: 'Camping und Umgebung'
	},
	village: { nb: 'Bygda og vatnet', en: 'The village and the lake', de: 'Das Dorf und der See' },
	outdoors: {
		nb: 'Friluftsliv gjennom året',
		en: 'Outdoor life throughout the year',
		de: 'Draußen zu jeder Jahreszeit'
	}
} as const;

export interface Photo {
	id: string;
	group: keyof typeof photoGroups;
	alt: Record<Locale, string>;
}

export const photos = [
	{
		id: 'camping-by-the-lake',
		group: 'camping',
		alt: {
			nb: 'Campingliv på Sletta, ved Lisskorovatnet',
			en: 'Camping at Sletta, by lake Lisskorovatnet',
			de: 'Camping auf Sletta am Lisskorovatnet'
		}
	},
	{
		id: 'camping-motorhome-pitches',
		group: 'camping',
		alt: {
			nb: 'Bobiler mellom bjørketrærne',
			en: 'Motorhomes among the birch trees',
			de: 'Wohnmobile zwischen Birken'
		}
	},
	{
		id: 'camping-woodland-seating',
		group: 'camping',
		alt: {
			nb: 'Bobilplasser, Kleiva',
			en: 'Motorhome pitches, Kleiva',
			de: 'Wohnmobilstellplätze, Kleiva'
		}
	},
	{
		id: 'skorovas-mountain-village',
		group: 'village',
		alt: {
			nb: 'Utsikt over Skorovas og fjellene',
			en: 'Skorovas and the surrounding mountains',
			de: 'Skorovas und die umliegenden Berge'
		}
	},
	{
		id: 'lisskorvatnet-autumn',
		group: 'village',
		alt: {
			nb: 'Høstfarger ved Lisskorovatnet',
			en: 'Autumn colours by Lisskorovatnet',
			de: 'Herbstfarben am Lisskorovatnet'
		}
	},
	{
		id: 'lisskorvatnet-campfire',
		group: 'village',
		alt: {
			nb: 'Bål ved Lisskorovatnet',
			en: 'A campfire by lake Lisskorovatnet',
			de: 'Lagerfeuer am Lisskorovatnet'
		}
	},
	{
		id: 'lake-evening-light',
		group: 'village',
		alt: {
			nb: 'Kveldslys over Lisskorovatnet',
			en: 'Evening light over lake Lisskorovatnet',
			de: 'Abendlicht über dem Lisskorovatnet'
		}
	},
	{
		id: 'mountain-lake-landscape',
		group: 'outdoors',
		alt: {
			nb: 'Fjell og vatn i turterrenget',
			en: 'Mountains and lakes in the hiking country',
			de: 'Berge und Seen in der Wanderlandschaft'
		}
	},
	{
		id: 'mountain-biking',
		group: 'outdoors',
		alt: {
			nb: 'På sykkel i fjellet',
			en: 'Mountain biking',
			de: 'Mit dem Fahrrad im Gebirge'
		}
	},
	{
		id: 'hiking-gathering',
		group: 'outdoors',
		alt: {
			nb: 'Turfolk samlet for gruvepub',
			en: 'Hikers gathered for a mine pub event',
			de: 'Wanderer treffen sich zum Grubenpub'
		}
	},
	{
		id: 'trout-catch',
		group: 'outdoors',
		alt: {
			nb: 'Ørretfangst og fiskeutstyr',
			en: 'A trout catch and fishing tackle',
			de: 'Forellenfang und Angelausrüstung'
		}
	},
	{
		id: 'cloudberry-harvest',
		group: 'outdoors',
		alt: {
			nb: 'Multer fra en tur i fjellet',
			en: 'Cloudberries gathered on a mountain walk',
			de: 'Moltebeeren von einer Bergwanderung'
		}
	},
	{
		id: 'winter-cabins',
		group: 'outdoors',
		alt: {
			nb: 'Snødekte hytter og fjell',
			en: 'Snow-covered cabins and mountains',
			de: 'Verschneite Hütten und Berge'
		}
	},
	{
		id: 'winter-sun',
		group: 'outdoors',
		alt: {
			nb: 'Sol over vinterlandskapet',
			en: 'Sunshine over the winter landscape',
			de: 'Sonne über der Winterlandschaft'
		}
	},
	{
		id: 'skiing-in-the-mountains',
		group: 'outdoors',
		alt: {
			nb: 'På ski i solskinnet',
			en: 'Skiing in the sunshine',
			de: 'Skifahren im Sonnenschein'
		}
	},
	{
		id: 'snowkiting',
		group: 'outdoors',
		alt: {
			nb: 'Snøkiting på vidda',
			en: 'Snowkiting on the plateau',
			de: 'Snowkiten auf der Hochebene'
		}
	},
	{
		id: 'snowkite-on-the-plateau',
		group: 'outdoors',
		alt: {
			nb: 'Kite i vinterfjellet',
			en: 'A kite in the winter mountains',
			de: 'Ein Kite im Wintergebirge'
		}
	},
	{
		id: 'snow-covered-plateau',
		group: 'outdoors',
		alt: {
			nb: 'Rypene soler seg i fjellet',
			en: 'Ptarmigans basking in the mountain sunshine',
			de: 'Schneehühner sonnen sich im Gebirge'
		}
	},
	{
		id: 'winter-trail',
		group: 'outdoors',
		alt: {
			nb: 'Løypekjøring i Skorovasfjellene',
			en: 'Grooming ski trails in the Skorovas mountains',
			de: 'Loipenpräparierung in den Bergen von Skorovas'
		}
	},
	{
		id: 'snowmobile-outing',
		group: 'outdoors',
		alt: {
			nb: 'En pause på snøscooterturen',
			en: 'A break on a snowmobile outing',
			de: 'Pause auf einer Schneemobiltour'
		}
	}
] as const satisfies readonly Photo[];

export type PhotoId = (typeof photos)[number]['id'];

const pagePhotos: Partial<Record<string, readonly PhotoId[]>> = {
	home: ['camping-by-the-lake', 'lisskorvatnet-campfire', 'winter-cabins'],
	camping: ['camping-by-the-lake', 'camping-woodland-seating', 'lisskorvatnet-campfire'],
	experiences: [
		'mountain-biking',
		'trout-catch',
		'cloudberry-harvest',
		'snowkiting',
		'winter-cabins',
		'skiing-in-the-mountains'
	],
	skorovas: ['skorovas-mountain-village', 'lisskorvatnet-campfire', 'lake-evening-light']
};

export function photosForPage(id: string): readonly Photo[] {
	return (pagePhotos[id] ?? []).map((imageId) => photos.find((photo) => photo.id === imageId)!);
}
