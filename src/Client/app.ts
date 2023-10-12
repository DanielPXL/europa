import Drawer from "./drawing";

async function main() {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d");
	
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	
	window.addEventListener("resize", resizeCanvas, false);
	resizeCanvas();

	const countries = await fetch("countries.json").then(r => r.json());
	console.log(countries);

	ctx.strokeStyle = "black";
	const drawer = new Drawer(ctx);

	let clickedStart: number[] = null;
	canvas.addEventListener("mousedown", e => {
		clickedStart = [e.clientX, e.clientY];
	});

	document.addEventListener("mouseup", e => {
		clickedStart = null;
	});

	canvas.addEventListener("mousemove", e => {
		if (clickedStart) {
			const [x, y] = clickedStart;
			const [dx, dy] = [e.clientX - x, e.clientY - y];

			drawer.cameraPos[0] -= dx / window.innerWidth / drawer.zoom;
			drawer.cameraPos[1] -= dy / window.innerWidth / drawer.zoom;

			clickedStart = [e.clientX, e.clientY];
		}
	});

	canvas.addEventListener("wheel", e => {
		const [x, y] = drawer.inverseCameraTransform([e.clientX, e.clientY]);
		drawer.zoom *= Math.pow(1.1, -e.deltaY / 100);
		const [x2, y2] = drawer.cameraTransform([x, y]);
		drawer.cameraPos[0] += (x2 - e.clientX) / window.innerWidth / drawer.zoom;
		drawer.cameraPos[1] += (y2 - e.clientY) / window.innerWidth / drawer.zoom;
	});

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (const country of countries.countries) {
			drawer.drawCountry(country.geometry);
		}

		requestAnimationFrame(draw);
	}

	draw();
}

main();