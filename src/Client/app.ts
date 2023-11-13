import * as Three from "three";
import * as Geo from "./geo";
import { POIInfo, findNearestPOI } from "./poi";
import Drawer from "./drawing";

async function main() {
	const poiHoverTitle = document.getElementById("poi-hover-title") as HTMLDivElement;

	let focusState: "map" | "poi" = "map";
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
		if (focusState === "map") {
			if (clickedStart) {
				const [x, y] = clickedStart;
				const delta = new Three.Vector2(e.clientX - x, e.clientY - y);
	
				drawer.moveCamera(delta);
	
				clickedStart = [e.clientX, e.clientY];
			}
	
			const t = drawer.inverseCameraTransform(new Three.Vector3(e.clientX, e.clientY, 0));
			const nearest = findNearestPOI(drawer.pois, t.x, t.y);
			const clientPos = drawer.cameraTransform(nearest.sprite.position);
			const nearestDist = Math.sqrt((clientPos.x - e.clientX) ** 2 + (clientPos.y - e.clientY) ** 2);
	
			// console.log("Mouse: ", e.clientX, e.clientY, "Nearest: ", clientPos.x, clientPos.y, nearestDist);
			if (nearestDist < 25) {
				// console.log("Hit!");
				document.body.style.cursor = "pointer";
				
				poiHoverTitle.innerHTML = nearest.info.name;

				poiHoverTitle.style.display = "block";
				poiHoverTitle.style.left = `${clientPos.x + 30}px`;
				poiHoverTitle.style.top = `${clientPos.y - 20}px`;
			} else {
				document.body.style.cursor = "default";

				poiHoverTitle.style.display = "none";
			}
		}
	});

	document.addEventListener("wheel", e => {
		if (focusState === "map") {
			drawer.zoomTo(new Three.Vector3(e.clientX, e.clientY), e.deltaY);
		}
	});

	function draw() {
		if (focusState === "map") {
			drawer.draw();
		}

		requestAnimationFrame(draw);
	}

	draw();
}

main();