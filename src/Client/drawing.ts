// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_(JavaScript/ActionScript,_etc.)
export function mercatorProject(point: number[]): number[] {
	const [lon, lat] = point;

	let x = (lon + 180) / 360;
	let y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;

	return [
		x,
		y
	]
}

export type CountryGeometry = {
	type: "Polygon",
	coordinates: number[][][]
} | {
	type: "MultiPolygon",
	coordinates: number[][][][]
}

export default class Drawer {
	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	ctx: CanvasRenderingContext2D;
	zoom: number = 1;
	cameraPos: number[] = [0, 0];

	cameraTransform(point: number[]): number[] {
		const [x, y] = point;
		const [cx, cy] = this.cameraPos;

		return [
			(x - cx) * this.zoom * window.innerWidth,
			(y - cy) * this.zoom * window.innerWidth
		];
	}

	inverseCameraTransform(point: number[]): number[] {
		const [x, y] = point;
		const [cx, cy] = this.cameraPos;

		return [
			x / this.zoom / window.innerWidth + cx,
			y / this.zoom / window.innerWidth + cy
		];
	}

	drawPolygon(points: number[][]) {
		this.ctx.beginPath();
		const [x, y] = this.cameraTransform(mercatorProject(points[0]));
		this.ctx.moveTo(x, y);

		for (let i = 1; i < points.length; i++) {
			const [x, y] = this.cameraTransform(mercatorProject(points[i]));
			this.ctx.lineTo(x, y);
		}

		this.ctx.closePath();
		this.ctx.stroke();
	}

	drawMultiPolygon(polygons: number[][][][]) {
		for (const polygon of polygons) {
			this.drawPolygon(polygon[0]);
		}
	}

	drawCountry(geometry: CountryGeometry) {
		switch (geometry.type) {
			case "Polygon":
				this.drawPolygon(geometry.coordinates[0]);
				break
			case "MultiPolygon":
				this.drawMultiPolygon(geometry.coordinates);
				break
			default:
				throw new Error("Unknown geometry type: " + (geometry as any).type);
		}
	}

	moveCamera(delta: number[]) {
		this.cameraPos[0] -= delta[0] / window.innerWidth / this.zoom;
		this.cameraPos[1] -= delta[1] / window.innerWidth / this.zoom;
	}

	zoomTo(mouse: number[], deltaY: number) {
		const [x, y] = this.inverseCameraTransform(mouse);
		this.zoom *= Math.pow(1.1, -deltaY / 100);
		const [x2, y2] = this.cameraTransform([x, y]);
		this.cameraPos[0] += (x2 - mouse[0]) / window.innerWidth / this.zoom;
		this.cameraPos[1] += (y2 - mouse[1]) / window.innerWidth / this.zoom
	}
}