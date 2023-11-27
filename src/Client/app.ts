import { Category, POIInfo } from "./poi";
import { GeoMap } from "./map";
import { Sidebar } from "./sidebar";
import { ContentPopup } from "./contentPopup";

const categoriesProm = fetch("categories.json").then(r => r.json()) as Promise<Category[]>;
const poisProm = fetch("pois.json").then(r => r.json()) as Promise<POIInfo[]>;

async function main() {
	const [
		categories,
		pois
	] = await Promise.all([
		categoriesProm,
		poisProm
	]);
	
	let state: "map" | "content" = "map";

	const contentPopup = new ContentPopup();
	const map = new GeoMap((poi) => {
		contentPopup.showContent(poi);
		state = "content";
		map.setView([poi.lat, poi.lon]);
	});

	const sidebar = new Sidebar((poi) => {
		contentPopup.showContent(poi);
		state = "content";
		map.setView([poi.lat, poi.lon]);
	});

	for (const category of categories) {
		map.addPOICategory(category);
		sidebar.addPOICategory(category);
	}

	for (const poi of pois) {
		map.addPOI([poi.lat, poi.lon], poi);
		sidebar.addPOI(poi);
	}

	function checkClick(x: number, y: number) {
		if (state === "content") {
			const bounds = contentPopup.poiContent.getBoundingClientRect();
			if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
				contentPopup.hideContent();
				state = "map";
			}
		}
	}

	document.addEventListener("mousedown", (e) => {
		checkClick(e.clientX, e.clientY);
	});

	document.addEventListener("touchstart", (e) => {
		checkClick(e.touches[0].clientX, e.touches[0].clientY);
	});

	function checkIfSidebarShouldBeVisible() {
		if (window.innerWidth < window.innerHeight || window.innerWidth < 800) {
			sidebar.hide();
		} else {
			if (state === "map") {
				sidebar.show();
			}
		}
	}

	window.addEventListener("resize", (e) => {
		checkIfSidebarShouldBeVisible();
	});

	checkIfSidebarShouldBeVisible();
}

document.addEventListener("DOMContentLoaded", main);