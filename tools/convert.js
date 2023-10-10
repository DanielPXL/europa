import fs from "node:fs/promises";
import { argv } from "node:process";

async function convert(path) {
	const geoJsonString = await fs.readFile(path, "utf8");
	const geoJson = JSON.parse(geoJsonString);
	
	const europeanCountries = geoJson.features.filter(feature => feature.properties.CONTINENT === "Europe");

	const newJson = {
		countries: []
	};

	for (const country of europeanCountries) {
		newJson.countries.push({
			name: country.properties.NAME_DE,
			iso: country.properties.ISO_A3,
			geometry: country.geometry
		});
	}

	await fs.writeFile("countries.json", JSON.stringify(newJson));
}

convert(argv[2]);