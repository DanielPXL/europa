import * as Three from "three";

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_(JavaScript/ActionScript,_etc.)
export function mercatorProject(point: number[]): number[] {
	const [lon, lat] = point;

	let x = (lon + 180) / 360;
	let y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;

	// Modified to go from -1 to 1
	return [
		x * 2 - 1,
		-y * 2 + 1
	]
}

export type BufferPointer = { pointer: number, length: number}

export type CountryGeometry = {
	type: "Polygon",
	coordinates: BufferPointer
} | {
	type: "MultiPolygon",
	coordinates: BufferPointer[]
}

function addPolygon(points: BufferPointer, coordBuffer: Float32Array, callback: (points: Three.Vector3[]) => void) {
	const vertices = [];

	// for (const point of points) {
	// 	const [x, y] = mercatorProject(point);
	// 	vertices.push(new Three.Vector3(x, y, 0));
	// }

	for (let i = points.pointer; i < points.pointer + points.length; i += 2) {
		const x = coordBuffer[i];
		const y = coordBuffer[i + 1];

		const [projX, projY] = mercatorProject([x, y]);

		vertices.push(new Three.Vector3(projX, projY, 0));
	}

	callback(vertices);
}

function addMultiPolygon(polygons: BufferPointer[], coordBuffer: Float32Array, callback: (points: Three.Vector3[]) => void) {
	for (const polygon of polygons) {
		addPolygon(polygon, coordBuffer, callback);
	}
}

export function addCountry(geometry: CountryGeometry, coordBuffer: Float32Array, callback: (points: Three.Vector3[]) => void) {
	switch (geometry.type) {
		case "Polygon":
			addPolygon(geometry.coordinates, coordBuffer, callback);
			break
		case "MultiPolygon":
			addMultiPolygon(geometry.coordinates, coordBuffer, callback);
			break
		default:
			throw new Error("Unknown geometry type: " + (geometry as any).type);
	}
}