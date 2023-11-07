import * as Three from "three";
import * as Geo from "./geo";
import { POI } from "./poi";
import Drawer from "./drawing";

async function main() {
	// window.addEventListener("resize", resizeCanvas, false);
	// resizeCanvas();

	const drawer = new Drawer();

	const countries = await fetch("countries.json").then(r => r.json());
	// console.log(countries);

	for (const country of countries.countries) {
		Geo.addCountry(country.geometry, drawer.addLine.bind(drawer));
	}

	const pois = await fetch("pois.json").then(r => r.json()) as POI[];
	for (const poi of pois) {
		const [x, y] = Geo.mercatorProject([poi.lon, poi.lat]);
		const point = new Three.Vector3(x, y, -1);
		drawer.addCircle(point, 0.001);
	}

	let clickedStart: number[] = null;
	document.addEventListener("mousedown", e => {
		clickedStart = [e.clientX, e.clientY];
	});

	document.addEventListener("mouseup", e => {
		clickedStart = null;
	});

	document.addEventListener("mousemove", e => {
		// console.log(drawer.cameraTransform(drawer.inverseCameraTransform([e.clientX, e.clientY])));
		if (clickedStart) {
			const [x, y] = clickedStart;
			const delta = new Three.Vector2(e.clientX - x, e.clientY - y);

			drawer.moveCamera(delta);

			clickedStart = [e.clientX, e.clientY];
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