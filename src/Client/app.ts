import * as Three from "three";
import * as Geo from "./geo";
import { POIInfo, findNearestPOI } from "./poi";
import Drawer from "./drawing";

async function main() {
	// resizeCanvas();

	const drawer = new Drawer();

	const countries = await fetch("countries.json").then(r => r.json());
	// console.log(countries);

	for (const country of countries.countries) {
		Geo.addCountry(country.geometry, (points) => {
			drawer.addLine(points);
		});
	}

	const pois = await fetch("pois.json").then(r => r.json()) as POIInfo[];
	for (const poi of pois) {
		const [x, y] = Geo.mercatorProject([poi.lon, poi.lat]);
		const pos = new Three.Vector3(x, y, 1);
		drawer.addPOI(pos, poi);
	}

	window.addEventListener("resize", () => {
		drawer.resize(window.innerWidth, window.innerHeight);
	}, false);

	let clickedStart: number[] = null;
	document.addEventListener("mousedown", e => {
		clickedStart = [e.clientX, e.clientY];
	});

	document.addEventListener("mouseup", e => {
		clickedStart = null;
	});

	document.addEventListener("mousemove", e => {
		if (clickedStart) {
			const [x, y] = clickedStart;
			const delta = new Three.Vector2(e.clientX - x, e.clientY - y);

			drawer.moveCamera(delta);

			clickedStart = [e.clientX, e.clientY];
		}

		const t = drawer.inverseCameraTransform(new Three.Vector3(e.clientX, e.clientY, 0));
		const nearest = findNearestPOI(drawer.pois, t.x, t.y);
		const nearestDist = Math.sqrt((nearest.sprite.position.x - t.x) ** 2 + (nearest.sprite.position.y - t.y) ** 2);

		// console.log("Mouse: ", t.x, t.y, "Nearest: ", nearest.sprite.position.x, nearest.sprite.position.y, nearestDist);
		if (nearestDist < 0.1) {
			console.log("Hit!");
		}
	});

	document.addEventListener("wheel", e => {
		drawer.zoomTo(new Three.Vector3(e.clientX, e.clientY), e.deltaY);
	});

	function draw() {
		drawer.draw();

		requestAnimationFrame(draw);
	}

	draw();
}

main();