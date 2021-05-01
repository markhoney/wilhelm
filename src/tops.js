const slayer = require('slayer');

function bands(bins) {
	const bands = [];
	const limit = bins.length / 64;
	while (bins.length > limit) {
		const half = Math.ceil(bins.length / 2);
		const band = bins.splice(half);
		const max = Math.max(...band);
		const index = band.indexOf(max);
		bands.push([bins.length + index, max]); //
	}
	return bands.reverse();
}

async function peaks(fft) {
	const peaks = await slayer().fromArray(fft);
	return peaks.map((peak) => [peak.x, peak.y]);
}

module.exports = {bands, peaks};
