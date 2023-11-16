import { BSON } from "bson";
import fs from "node:fs/promises";
import { argv } from "node:process";

async function convert(path) {
	const geoJsonString = await fs.readFile(path, "utf8");
	const geoJson = JSON.parse(geoJsonString);
	
	const europeanCountries = geoJson.features.filter(feature => feature.properties.CONTINENT === "Europe");

	const newJson = {
		countries: []
	};

	const coordinates = [];
	let pos = 0;

	function convertGeometry(geometry) {
		switch (geometry.type) {
			case "Polygon":
				const start = pos;
				for (const point of geometry.coordinates[0]) {
					coordinates.push(point[0]);
					coordinates.push(point[1]);
					pos += 2;
				}
				
				return { pointer: start, length: pos - start };
			case "MultiPolygon":
				let polygons = [];
				for (const polygon of geometry.coordinates) {
					const start = pos;

					for (const point of polygon[0]) {
						coordinates.push(point[0]);
						coordinates.push(point[1]);
						pos += 2;
					}

					polygons.push({ pointer: start, length: pos - start });
				}

				return polygons;
			default:
				console.log(`Unknown geometry type: ${geometry.type}`);
		}
	}

	for (const country of geoJson.features) {
		newJson.countries.push({
			name: country.properties.NAME_DE,
			iso: country.properties.ISO_A3,
			geometry: {
				type: country.geometry.type,
				coordinates: convertGeometry(country.geometry)
			},
			isEuropean: country.properties.ISO_A3 == "RUS" ? false : country.properties.CONTINENT === "Europe"
		});
	}

	// console.log(newJson.countries[0].geometry);

	await fs.writeFile("countriesMap.json", JSON.stringify(newJson));

	const buffer = new Float32Array(coordinates).buffer;
	await fs.writeFile("countries.bin", Buffer.from(buffer));
}

convert(argv[2]);