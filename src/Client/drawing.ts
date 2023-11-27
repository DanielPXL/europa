import { Color } from "./poi";

export function HSVtoRGB(col: Color) {
	const h = col.h / 360;
	const s = col.s / 100;
	const v = col.v / 100;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

	let r, g, b;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
	// Hex
	return "#" + Math.floor(r * 255).toString(16) + Math.floor(g * 255).toString(16) + Math.floor(b * 255).toString(16);
}