import { marked } from "marked";
import { POIInfo } from "./poi";

export class ContentPopup {
	constructor() {
		this.poiContent = document.getElementById("poi-content") as HTMLDivElement;
		this.poiImageContainer = document.getElementById("poi-image-container") as HTMLDivElement;
		this.poiContentText = document.getElementById("poi-content-text") as HTMLDivElement;
		this.categoryContainer = document.getElementById("category-container") as HTMLDivElement;
	}

	poiContent: HTMLDivElement;
	poiImageContainer: HTMLDivElement;
	poiContentText: HTMLDivElement;
	categoryContainer: HTMLDivElement;
	
	imageContainers: HTMLDivElement[];

	updateContentImages(urls: string[]) {
		if (this.imageContainers) {
			for (const container of this.imageContainers) {
				container.remove();
			}
		}

		this.imageContainers = [];

		this.poiImageContainer.style.gridTemplateColumns = `repeat(${urls.length}, 1fr)`;

		for (let i = 0; i < urls.length; i++) {
			const img = document.createElement("img");
			img.src = urls[i];
			img.addEventListener("load", () => {
				img.style.minWidth = "100%";
				img.style.minHeight = "100%";

				if (img.naturalWidth > img.naturalHeight) {
					img.style.width = "auto";
					img.style.height = "100%";
				} else {
					img.style.width = "100%";
					img.style.height = "auto";
				}
			});

			const div = document.createElement("div");
			div.style.gridColumn = `${i + 1}`;
			div.style.gridRow = "1";
			div.style.width = "100%";
			div.style.height = "100%";
			div.style.overflow = "hidden";

			div.appendChild(img);
			this.poiImageContainer.appendChild(div);
			this.imageContainers.push(div);
		}
	}

	showContent(poi: POIInfo) {
		document.body.style.cursor = "";
		this.categoryContainer.style.left = "-360px";

		this.updateContentImages(poi.imageURLs);
		this.poiContent.style.left = "50%"

		this.poiContentText.innerHTML = marked.parse(`## ${poi.name}\n\n${poi.content}`);
	}

	hideContent() {
		this.poiContent.style.left = "150%";
		if (window.innerHeight < window.innerWidth && window.innerWidth > 800) {
			this.categoryContainer.style.left = "60px";
		}
	}
}