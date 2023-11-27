import L from "leaflet";
import { Category, Color, POIInfo } from "./poi";

export class GeoMap {
	constructor(clickCallback: (poi: POIInfo) => void) {
		this.map = L.map("map").setView([49.74273628823366, 9.31436941229379], 5);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 18,
			minZoom: 3,
			attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors"
		}).addTo(this.map);

		this.clickCallback = clickCallback;
	}

	clickCallback: (poi: POIInfo) => void;

	map: L.Map;
	categories: { [category: string]: Category } = {};

	addPOICategory(category: Category) {
		this.categories[category.name] = category;
	}

	addPOI(pos: L.LatLngExpression, poi: POIInfo) {
		const color = this.categories[poi.category].color;

		const icon = L.divIcon({
			html: `<img src="poidot.png" style="position: relative; width: 2.5rem; height: 3.33rem; left: 50%; top: 50%; transform: translate(-50%, -100%); filter: hue-rotate(${color.h}deg) brightness(${color.s}%);">`,
			iconSize: [0, 0],
			iconAnchor: [0, 0],
			// 3 rem = 3 * font-size
			popupAnchor: [0, -3.4 * parseFloat(getComputedStyle(document.documentElement).fontSize)],
			tooltipAnchor: [0, -3.4 * parseFloat(getComputedStyle(document.documentElement).fontSize)]
		});

		const marker = L.marker(pos, { icon }).addTo(this.map);
		marker.bindPopup(`<h2 style="margin: 2px">${poi.name}</h2><h4 style="margin: 2px">${this.categories[poi.category].displayName}</h4>`);
		marker.on("mouseover", () => {
			marker.openPopup();
		});

		marker.on("mouseout", () => {
			marker.closePopup();
		});

		marker.on("click", () => {
			this.clickCallback(poi);
		});
	}

	setView(pos: L.LatLngExpression) {
		this.map.setView(pos, this.map.getZoom(), { animate: true, duration: 0.5 });
	}
}