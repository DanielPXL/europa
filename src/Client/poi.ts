import * as Three from "three";

export interface POIInfo {
	name: string;
	lat: number;
	lon: number;
}

export interface POI {
	sprite: Three.Sprite,
	info: POIInfo,
	realPos: Three.Vector2
}

export function findNearestPOI(pois: POI[], x: number, y: number) {
	let nearest = pois[0];
	let nearestSqrDist = Infinity;

	for (const poi of pois) {
		const dX = poi.sprite.position.x - x;
		const dY = poi.sprite.position.y - y;
		const sqrDist = dX * dX + dY * dY;
		
		if (sqrDist < nearestSqrDist) {
			nearest = poi;
			nearestSqrDist = sqrDist;
		}
	}

	return nearest;
}