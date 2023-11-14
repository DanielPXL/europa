import * as Three from "three";
import { Category, POI, POIInfo } from "./poi";

export default class Drawer {
	constructor() {
		this.scene = new Three.Scene();
		const aspect = window.innerHeight / window.innerWidth;
		this.camera = new Three.OrthographicCamera(-1, 1, aspect, -aspect, 0.1, 100);

		this.lineParent = new Three.Object3D();
		this.scene.add(this.lineParent);
		this.poiParent = new Three.Object3D();
		this.scene.add(this.poiParent);
		
		this.renderer = new Three.WebGLRenderer({
			antialias: true
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xFFFFFF, 1);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 5;

		this.lineMaterial = new Three.LineBasicMaterial({
			color: 0xAAAAAA,
			linewidth: 1
		});

		this.lineMaterialEurope = new Three.LineBasicMaterial({
			color: 0x000000,
			linewidth: 1
		});

		// POI dot found on https://fontawesome.com/icons/location-dot?f=classic&s=solid
		this.poiDot = new Three.TextureLoader().load("poidot.png");
	}

	scene: Three.Scene;
	camera: Three.OrthographicCamera;
	renderer: Three.WebGLRenderer;

	lineParent: Three.Object3D;
	poiParent: Three.Object3D;
	pois: POI[] = [];

	lineMaterial: Three.LineBasicMaterial;
	lineMaterialEurope: Three.LineBasicMaterial;

	poiDot: Three.Texture;
	poiMaterials: { [category: string]: Three.SpriteMaterial } = {};

	zoom = 1;

	draw() {
		this.updateCameraZoom();

		this.renderer.render(this.scene, this.camera);
	}

	addLine(points: Three.Vector3[], isEuropean: boolean) {
		const geometry = new Three.BufferGeometry().setFromPoints(points);
		const line = new Three.Line(geometry, isEuropean ? this.lineMaterialEurope : this.lineMaterial);
		this.lineParent.add(line);
	}

	addPOICategory(category: Category) {
		this.poiMaterials[category.name] = new Three.SpriteMaterial({
			map: this.poiDot,
			color: category.color
		});
	}

	addPOI(pos: Three.Vector3, poi: POIInfo) {
		const sprite = new Three.Sprite(this.poiMaterials[poi.category]);
		sprite.position.copy(pos);

		this.poiParent.add(sprite);
		this.pois.push({
			sprite,
			info: poi,
			realPos: new Three.Vector2(pos.x, pos.y)
		});
	}

	showCategoryOnly(category: string) {
		for (const poi of this.pois) {
			poi.sprite.visible = poi.info.category === category;
		}
	}

	showAllCategories() {
		for (const poi of this.pois) {
			poi.sprite.visible = true;
		}
	
	}

	updateCameraZoom() {
		const aspect = window.innerHeight / window.innerWidth;
		this.camera.left = -1 / this.zoom;
		this.camera.right = 1 / this.zoom;
		this.camera.top = aspect / this.zoom;
		this.camera.bottom = -aspect / this.zoom;
		this.camera.updateProjectionMatrix();

		const poiSize = 0.045 / (window.innerWidth / 1920);
		for (const poi of this.pois) {
			poi.sprite.scale.set(poiSize / this.zoom * 384 / 512, poiSize / this.zoom, 1);
			poi.sprite.position.y = poi.realPos.y + poiSize / (2 * this.zoom);
		}
	}

	resize(width: number, height: number) {
		this.renderer.setSize(width, height);
		this.updateCameraZoom();
	}

	cameraTransform(point: Three.Vector3): Three.Vector3 {
		const t = point
			.clone()
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