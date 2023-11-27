import fs from "node:fs/promises";
import { exec } from "node:child_process";

// Go through all files and directories recursively
// Convert every png to a jpg using ImageMagick

async function convert(dir) {
	const files = await fs.readdir(dir);
	for (const file of files) {
		const path = `${dir}/${file}`;
		const stat = await fs.stat(path);
		if (stat.isDirectory()) {
			await convert(path);
		} else if (stat.isFile() && file.endsWith(".png")) {
			exec(`magick.exe convert ${path} -quality 50 ${path.replace(".png", ".jpg")}`, (err, stdout, stderr) => {
				if (err) {
					console.error(err);
					return;
				}
				console.log(stdout);
				console.log(stderr);
			});
		}
	}
}

convert(".");