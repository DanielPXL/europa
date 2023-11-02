import Drawer from "./drawing";

async function main() {
	// window.addEventListener("resize", resizeCanvas, false);
	// resizeCanvas();

	const drawer = new Drawer();

	const countries = await fetch("countries.json").then(r => r.json());
	// console.log(countries);

	for (const country of countries.countries) {
		drawer.addCountry(country.geometry);
	}

	let clickedStart: number[] = null;
	document.addEventListener("mousedown", e => {
		clickedStart = [e.clientX, e.clientY];
	});

	document.addEventListener("mouseup", e => {
		clickedStart = null;
	});

	document.addEventListener("mousemove", e => {
		console.log(drawer.cameraTransform(drawer.inverseCameraTransform([e.clientX, e.clientY])));
		if (clickedStart) {
			const [x, y] = clickedStart;
			const delta = [e.clientX - x, e.clientY - y];

			drawer.moveCamera(delta);

			clickedStart = [e.clientX, e.clientY];
		}
	});

	document.addEventListener("wheel", e => {
		drawer.zoomTo([e.clientX, e.clientY], e.deltaY);
	});

	function draw() {
		drawer.draw();

		requestAnimationFrame(draw);
	}

	draw();
}

main();