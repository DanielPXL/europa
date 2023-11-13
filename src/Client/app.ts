import * as Three from "three";
import * as Geo from "./geo";
import { POIInfo, checkClientCollision, findNearestPOI } from "./poi";
import Drawer from "./drawing";
import { marked } from "marked";

async function main() {
	const poiHoverTitle = document.getElementById("poi-hover-title") as HTMLDivElement;
	const poiContent = document.getElementById("poi-content") as HTMLDivElement;
	const poiImageContainer = document.getElementById("poi-image-container") as HTMLDivElement;
	const poiContentText = document.getElementById("poi-content-text") as HTMLDivElement;

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

	let imageContainers: HTMLDivElement[];
	function updateContentImages(urls: string[]) {
		if (imageContainers) {
			for (const container of imageContainers) {
				container.remove();
			}
		}

		imageContainers = [];

		poiImageContainer.style.gridTemplateColumns = `repeat(${urls.length}, 1fr)`;

		for (let i = 0; i < urls.length; i++) {
			const img = document.createElement("img");
			img.src = urls[i];
			img.style.height = "100%";

			const div = document.createElement("div");
			div.style.gridColumn = `${i + 1}`;
			div.style.gridRow = "1";
			div.style.height = "100%";
			div.style.overflow = "hidden";

			div.appendChild(img);
			poiImageContainer.appendChild(div);
			imageContainers.push(div);
		}
	}

	function showContent(poi: POIInfo) {
		focusState = "poi";
		document.body.style.cursor = "";
		poiHoverTitle.style.display = "none";

		poiContent.style.display = "block";
		updateContentImages(poi.imageURLs);

		poiContentText.innerHTML = marked.parse(poi.content);
	}

	function hideContent() {
		focusState = "map";
		poiContent.style.display = "none";
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

		if (focusState === "map") {
			const { hit, nearest } = checkClientCollision(drawer, e.clientX, e.clientY);
			if (hit) {
				showContent(nearest.info);
			}
		} else {
			const bounds = poiContent.getBoundingClientRect();
			if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) {
				hideContent();
			}
		}
	});

	function updatePOImarker(mouseX: number, mouseY: number) {
		const { hit, nearest, clientPos } = checkClientCollision(drawer, mouseX, mouseY);
			// console.log("Mouse: ", e.clientX, e.clientY, "Nearest: ", clientPos.x, clientPos.y, nearestDist);
			if (hit) {
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

	document.addEventListener("mousemove", e => {
		if (focusState === "map") {
			if (clickedStart) {
				const [x, y] = clickedStart;
				const delta = new Three.Vector2(e.clientX - x, e.clientY - y);
	
				drawer.moveCamera(delta);
	
				clickedStart = [e.clientX, e.clientY];
			}
	
			updatePOImarker(e.clientX, e.clientY);
		}
	});

	document.addEventListener("wheel", e => {
		if (focusState === "map") {
			drawer.zoomTo(new Three.Vector3(e.clientX, e.clientY), e.deltaY);

			updatePOImarker(e.clientX, e.clientY);
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