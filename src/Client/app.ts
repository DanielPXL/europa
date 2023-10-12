import Drawer from "./drawing";

async function main() {
	const lqCanvas = document.getElementById("lowQualityCanvas") as HTMLCanvasElement;
	const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
	const ctx = mainCanvas.getContext("2d");
	
	function resizeCanvas() {
		mainCanvas.width = window.innerWidth;
		mainCanvas.height = window.innerHeight;
	}
	
	window.addEventListener("resize", resizeCanvas, false);
	resizeCanvas();

	const countries = await fetch("countries.json").then(r => r.json());
	// console.log(countries);

	ctx.strokeStyle = "black";
	const drawer = new Drawer(ctx);

	let clickedStart: number[] = null;
	mainCanvas.addEventListener("mousedown", e => {
		clickedStart = [e.clientX, e.clientY];
	});

	document.addEventListener("mouseup", e => {
		clickedStart = null;
	});

	mainCanvas.addEventListener("mousemove", e => {
		if (clickedStart) {
			const [x, y] = clickedStart;
			const delta = [e.clientX - x, e.clientY - y];

			drawer.moveCamera(delta);

			clickedStart = [e.clientX, e.clientY];
		}
	});

	mainCanvas.addEventListener("wheel", e => {
		drawer.zoomTo([e.clientX, e.clientY], e.deltaY);
	});

	function draw() {
		ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

		for (const country of countries.countries) {
			drawer.drawCountry(country.geometry);
		}

		requestAnimationFrame(draw);
	}

	draw();
}

main();