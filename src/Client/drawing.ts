import * as Three from "three";

export default class Drawer {
	constructor() {
		this.scene = new Three.Scene();
		const aspect = window.innerHeight / window.innerWidth;
		this.camera = new Three.OrthographicCamera(-1, 1, aspect, -aspect, 0.1, 100);
		
		this.renderer = new Three.WebGLRenderer({
			antialias: true
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xFFFFFF, 1);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 5;

		this.lineMaterial = new Three.LineBasicMaterial({
			color: 0x000000,
			linewidth: 1
		});
	}

	scene: Three.Scene;
	camera: Three.OrthographicCamera;
	renderer: Three.WebGLRenderer;

	lineMaterial: Three.LineBasicMaterial;

	zoom = 1;

	draw() {
		this.updateCameraZoom();

		this.renderer.render(this.scene, this.camera);
	}

	addLine(points: Three.Vector3[]) {
		const geometry = new Three.BufferGeometry().setFromPoints(points);
		const line = new Three.Line(geometry, this.lineMaterial);
		this.scene.add(line);
	}

	addCircle(point: Three.Vector3, radius: number) {
		const geometry = new Three.CircleGeometry(radius, 32);
		const material = new Three.MeshBasicMaterial({ color: 0xFF0000 });
		const circle = new Three.Mesh(geometry, material);
		circle.position.copy(point);
		this.scene.add(circle);
	}

	updateCameraZoom() {
		const aspect = window.innerHeight / window.innerWidth;
		this.camera.left = -1 / this.zoom;
		this.camera.right = 1 / this.zoom;
		this.camera.top = aspect / this.zoom;
		this.camera.bottom = -aspect / this.zoom;
		this.camera.updateProjectionMatrix();
	}

	cameraTransform(point: Three.Vector3): Three.Vector3 {

		const t = point
			.applyMatrix4(this.camera.matrixWorldInverse)
			.applyMatrix4(this.camera.projectionMatrix);

		
		t.x = (t.x + 1) / 2 * window.innerWidth,
		t.y = (-t.y + 1) / 2 * window.innerHeight

		return t;
	}

	inverseCameraTransform(point: Three.Vector3): Three.Vector3 {
		const x = point.x / window.innerWidth * 2 - 1;
		const y = -point.y / window.innerHeight * 2 + 1;
		const t = new Three.Vector3(x, y, 0)
			.applyMatrix4(this.camera.projectionMatrixInverse)
			.applyMatrix4(this.camera.matrixWorld);
		
		return t;
	}

	moveCamera(delta: Three.Vector2) {
		this.camera.position.x -= 2 * delta.x / window.innerWidth / this.zoom;
		this.camera.position.y += 2 * delta.y / window.innerWidth / this.zoom;
	}

	zoomTo(mouse: Three.Vector3, deltaY: number) {
		const p1 = this.inverseCameraTransform(mouse);
		this.zoom *= Math.pow(1.1, -deltaY / 100);
		this.updateCameraZoom();
		const p2 = this.cameraTransform(p1);
		this.camera.position.x += 2 * (p2.x - mouse.x) / window.innerWidth / this.zoom;
		this.camera.position.y -= 2 * (p2.y - mouse.y) / window.innerWidth / this.zoom
	}
}