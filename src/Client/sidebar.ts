import { HSVtoRGB } from "./drawing";
import { Category, POIInfo } from "./poi";

export class Sidebar {
	constructor(clickCallback: (poi: POIInfo) => void) {
		this.categoriesDiv = document.getElementById("categories") as HTMLDivElement;
		this.categoryContainer = document.getElementById("category-container") as HTMLDivElement;
		this.clickCallback = clickCallback;
	}

	categoriesDiv: HTMLDivElement;
	categoryContainer: HTMLDivElement;

	clickCallback: (poi: POIInfo) => void;

	catItemLists: { [category: string]: HTMLDivElement } = {};

	addPOICategory(category: Category) {
		const categoryDiv = document.createElement("div");
		categoryDiv.className = "category";
		const categoryTitle = document.createElement("button");
		categoryTitle.className = "category-title";
		categoryTitle.innerHTML = category.displayName;
		categoryTitle.style.backgroundColor = HSVtoRGB(category.btnColor);
		categoryDiv.appendChild(categoryTitle);
		const categoryItemList = document.createElement("div");
		categoryItemList.className = "category-item-list";
		categoryItemList.style.backgroundColor = HSVtoRGB(category.btnColor);
		categoryDiv.appendChild(categoryItemList);
		this.catItemLists[category.name] = categoryItemList;

		categoryTitle.addEventListener("mouseenter", () => {
			categoryTitle.style.backgroundColor = HSVtoRGB(category.selColor);
			categoryItemList.style.backgroundColor = HSVtoRGB(category.selColor);
		});

		categoryTitle.addEventListener("mouseleave", () => {
			categoryTitle.style.backgroundColor = HSVtoRGB(category.btnColor);
			categoryItemList.style.backgroundColor = HSVtoRGB(category.btnColor);
		});

		categoryTitle.addEventListener("click", () => {
			const wasActive = categoryItemList.classList.contains("active");

			for (const cat of Object.values(this.catItemLists)) {
				cat.style.maxHeight = "0px";
				cat.classList.remove("active");
			}

			if (!wasActive) {
				categoryItemList.style.maxHeight = `${categoryItemList.scrollHeight}px`;
				categoryItemList.classList.add("active");

				// drawer.showCategoryOnly(category.name);
			} else {
				categoryItemList.style.maxHeight = "0px";
				categoryItemList.classList.remove("active");
				// drawer.showAllCategories();
			}
		});

		this.categoriesDiv.appendChild(categoryDiv);
	}

	addPOI(poi: POIInfo) {
		const item = document.createElement("button");
		item.className = "category-item";
		item.innerHTML = poi.name;

		item.addEventListener("click", () => {
			this.clickCallback(poi);
		});

		this.catItemLists[poi.category].appendChild(item);
	}

	hide() {
		this.categoryContainer.style.left = "-360px";
	}

	show() {
		this.categoryContainer.style.left = "60px";
	}
}