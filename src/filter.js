const slayer = require('slayer');

function threshold(peaks, threshold) {
	return peaks
		// .sort((a, b) => b.magnitude - a.magnitude)
		.filter((peak) => peak[1] > threshold);
}

const filters = {
	bands(fft) {
		const bands = [];
		const limit = fft.length / 64;
		while (fft.length > limit) {
			const half = Math.ceil(fft.length / 2);
			const band = fft.splice(half);
			const max = Math.max(...band);
			const index = band.indexOf(max);
			bands.push([fft.length + index, max]); //
		}
		return bands.reverse();
	},
	peaks: async(fft) => {
		const peaks = await slayer().fromArray(fft);
		return peaks.map((peak) => [peak.x, peak.y]);
	}
};

function maxima(peaks, magnitude = false) {
	if (magnitude) return threshold(peaks, magnitude);
	const average = peaks.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	return threshold(bands, average);
}

function fft(fft, mode, magnitude) {
	const peaks = filters[mode](fft);
	return filterMaxima(peaks, magnitude);
}

module.exports = {filters, maxima, fft};
