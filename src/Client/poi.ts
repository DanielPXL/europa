export interface Color {
	h: number;
	s: number;
	v: number;
}

export interface Category {
	displayName: string;
	name: string;
	color: Color;
	btnColor: Color;
	selColor: Color;
}

export interface POIInfo {
	name: string;
	category: string;
	lat: number;
	lon: number;
	imageURLs: string[];
	content: string;
}