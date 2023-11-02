import * as THREE from "three";

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

export type CountryGeometry = {
	type: "Polygon",
	coordinates: number[][][]
} | {
	type: "MultiPolygon",
	coordinates: number[][][][]
}

export default class Drawer {
	constructor() {
		this.scene = new THREE.Scene();
		const aspect = window.innerHeight / window.innerWidth;
		this.camera = new THREE.OrthographicCamera(-1, 1, aspect, -aspect, 0.1, 100);
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xFFFFFF, 1);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 5;

		this.lineMaterial = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 4
		});
	}

	scene: THREE.Scene;
	camera: THREE.OrthographicCamera;
	renderer: THREE.WebGLRenderer;

	lineMaterial: THREE.LineBasicMaterial;

	zoom = 1;

	draw() {
		this.updateCameraZoom();

		this.renderer.render(this.scene, this.camera);
	}

	updateCameraZoom() {
		const aspect = window.innerHeight / window.innerWidth;
		this.camera.left = -1 / this.zoom;
		this.camera.right = 1 / this.zoom;
		this.camera.top = aspect / this.zoom;
		this.camera.bottom = -aspect / this.zoom;
		this.camera.updateProjectionMatrix();
	}

	cameraTransform(point: number[]): number[] {
		const [x, y] = point;

		const t = new THREE.Vector3(x, y, 0)
			.applyMatrix4(this.camera.matrixWorldInverse)
			.applyMatrix4(this.camera.projectionMatrix);

		return [
			(t.x + 1) / 2 * window.innerWidth,
			(-t.y + 1) / 2 * window.innerHeight
		];
	}

	inverseCameraTransform(point: number[]): number[] {
		const x = point[0] / window.innerWidth * 2 - 1;
		const y = -point[1] / window.innerHeight * 2 + 1;
		const t = new THREE.Vector3(x, y, 0)
			.applyMatrix4(this.camera.projectionMatrixInverse)
			.applyMatrix4(this.camera.matrixWorld);
		
		return [
			t.x,
			t.y
		];
	}

	addPolygon(points: number[][]) {
		const vertices = [];

		for (const point of points) {
			const [x, y] = mercatorProject(point);
			vertices.push(new THREE.Vector3(x, y, 0));
		}

		const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
		const line = new THREE.Line(geometry, this.lineMaterial);
		this.scene.add(line);
	}

	addMultiPolygon(polygons: number[][][][]) {
		for (const polygon of polygons) {
			this.addPolygon(polygon[0]);
		}
	}

	addCountry(geometry: CountryGeometry) {
		switch (geometry.type) {
			case "Polygon":
				this.addPolygon(geometry.coordinates[0]);
				break
			case "MultiPolygon":
				this.addMultiPolygon(geometry.coordinates);
				break
			default:
				throw new Error("Unknown geometry type: " + (geometry as any).type);
		}
	}

	moveCamera(delta: number[]) {
		this.camera.position.x -= 2 * delta[0] / window.innerWidth / this.zoom;
		this.camera.position.y += 2 * delta[1] / window.innerWidth / this.zoom;
	}

	zoomTo(mouse: number[], deltaY: number) {
		const [x, y] = this.inverseCameraTransform(mouse);
		this.zoom *= Math.pow(1.1, -deltaY / 100);
		this.updateCameraZoom();
		const [x2, y2] = this.cameraTransform([x, y]);
		this.camera.position.x += 2 * (x2 - mouse[0]) / window.innerWidth / this.zoom;
		this.camera.position.y -= 2 * (y2 - mouse[1]) / window.innerWidth / this.zoom
	}
}