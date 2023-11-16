import * as Three from "three";
import * as Geo from "./geo";
import { Category, POIInfo, checkClientCollision, findNearestPOI } from "./poi";
import Drawer from "./drawing";
import { marked } from "marked";

const countriesMapProm = fetch("countriesMap.json").then(r => r.json());
const countriesProm = fetch("countries.bin").then(r => r.arrayBuffer());
const categoriesProm = fetch("categories.json").then(r => r.json()) as Promise<Category[]>;
const poisProm = fetch("pois.json").then(r => r.json()) as Promise<POIInfo[]>;

async function main() {
	console.log("Hello world!");
	const poiHoverTitle = document.getElementById("poi-hover-title") as HTMLDivElement;
	const poiContent = document.getElementById("poi-content") as HTMLDivElement;
	const poiImageContainer = document.getElementById("poi-image-container") as HTMLDivElement;
	const poiContentText = document.getElementById("poi-content-text") as HTMLDivElement;
	const categoriesDiv = document.getElementById("categories") as HTMLDivElement;
	const categoryContainer = document.getElementById("category-container") as HTMLDivElement;

	let focusState: "map" | "poi" = "map";
	const drawer = new Drawer();

	const [
		countriesMap,
		countries,
		categories,
		pois
	] = await Promise.all([
		countriesMapProm,
		countriesProm,
		categoriesProm,
		poisProm
	]);

	// console.log(countries);

	const coordBuffer = new Float32Array(countries);

	for (const country of countriesMap.countries) {
		Geo.addCountry(country.geometry, coordBuffer, (points) => {
			drawer.addLine(points, country.isEuropean);
		});
	}

	let catItemLists: { [category: string]: HTMLDivElement } = {};
	for (const category of categories) {
		drawer.addPOICategory(category);

		const categoryDiv = document.createElement("div");
		categoryDiv.className = "category";
		const categoryTitle = document.createElement("button");
		categoryTitle.className = "category-title";
		categoryTitle.innerHTML = category.displayName;
		categoryDiv.appendChild(categoryTitle);
		const categoryItemList = document.createElement("div");
		categoryItemList.className = "category-item-list";
		categoryDiv.appendChild(categoryItemList);
		catItemLists[category.name] = categoryItemList;

		categoryTitle.addEventListener("click", () => {
			const wasActive = categoryItemList.classList.contains("active");

			for (const cat of Object.values(catItemLists)) {
				cat.style.maxHeight = "0px";
				cat.classList.remove("active");
			}

			if (!wasActive) {
				categoryItemList.style.maxHeight = `${categoryItemList.scrollHeight}px`;
				categoryItemList.classList.add("active");

				drawer.showCategoryOnly(category.name);
			} else {
				categoryItemList.style.maxHeight = "0px";
				categoryItemList.classList.remove("active");
				drawer.showAllCategories();
			}
		});

		categoriesDiv.appendChild(categoryDiv);
	}

	for (const poi of pois) {
		const [x, y] = Geo.mercatorProject([poi.lon, poi.lat]);
		const pos = new Three.Vector3(x, y, 1);
		drawer.addPOI(pos, poi);
		
		const item = document.createElement("button");
		item.className = "category-item";
		item.innerHTML = poi.name;

		item.addEventListener("click", () => {
			showContent(poi);
		});

		catItemLists[poi.category].appendChild(item);
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
		categoryContainer.style.display = "none";

		poiContent.style.display = "block";
		updateContentImages(poi.imageURLs);

		poiContentText.innerHTML = marked.parse(poi.content);
	}

	function hideContent() {
		focusState = "map";
		poiContent.style.display = "none";
		categoryContainer.style.display = "block";
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

	let mousePos: THREE.Vector2 = new Three.Vector2();

	document.addEventListener("mousemove", e => {
		if (focusState === "map") {
			if (clickedStart) {
				const [x, y] = clickedStart;
				const delta = new Three.Vector2(e.clientX - x, e.clientY - y);
	
				drawer.moveCamera(delta);
	
				clickedStart = [e.clientX, e.clientY];
			}
		}

		mousePos.x = e.clientX;
		mousePos.y = e.clientY;
	});

	document.addEventListener("wheel", e => {
		if (focusState === "map") {
			drawer.zoomTo(new Three.Vector3(e.clientX, e.clientY), e.deltaY);
		}
	});

	function draw() {
		if (focusState === "map") {
			drawer.draw();
			updatePOImarker(mousePos.x, mousePos.y);
		}

		requestAnimationFrame(draw);
	}

	draw();
}

document.addEventListener("DOMContentLoaded", main);