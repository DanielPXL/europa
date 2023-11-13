import * as Three from "three";
import Drawer from "./drawing";

export interface POIInfo {
	name: string;
	lat: number;
	lon: number;
	imageURLs: string[];
	content: string;
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

export function checkClientCollision(drawer: Drawer, x: number, y: number) {
	const t = drawer.inverseCameraTransform(new Three.Vector3(x, y, 0));
	const nearest = findNearestPOI(drawer.pois, t.x, t.y);
	const clientPos = drawer.cameraTransform(nearest.sprite.position);
	const nearestDist = Math.sqrt((clientPos.x - x) ** 2 + (clientPos.y - y) ** 2);
	
	return { hit: nearestDist < 25, nearest, clientPos };
}