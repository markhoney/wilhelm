// const slayer = require('slayer');

function smoothArray(array, width) {
	return array.map((intensity, index, array) => {
		let start = index - width;
		if (start < 0) start = 0;
		const values = array.slice(start, index + width + 1);
		return values.reduce((a, b) => a + b) / values.length;
	});
}

function detectPeaks(array, smooth = 0) {
	if (smooth) array = smoothArray(array, smooth);
	return array.reduce((peaks, intensity, index, array) => {
		if ((index === 0 || (array[index - 1] < intensity)) && (index === array.length - 1 || (array[index + 1] < intensity))) peaks.push([index, intensity]);
		return peaks;
	}, []);
}

function limitPeaks(array, limit) {
	if (limit) array = array.sort((a, b) => b[1] - a[1]).slice(0, limit);
	return array.sort((a, b) => a[0] - b[0]);
}

function threshold(peaks, threshold) {
	return peaks
		// .sort((a, b) => b.magnitude - a.magnitude)
		.filter((peak) => peak[1] > threshold);
}

const filters = {
	bands(fft, limit = 10) {
		const bands = [];
		while (bands.length < limit) {
			const half = Math.ceil(fft.length / 2);
			const band = fft.splice(half);
			const max = Math.max(...band);
			const index = band.indexOf(max);
			bands.push([fft.length + index, max]); //
		}
		return bands.reverse();
	},
	peaks: (fft, limit = 10, smooth = 1) => {
		const peaks = detectPeaks(fft, smooth);
		return limitPeaks(peaks, limit);
	},
	/* peaks: async(fft, limit) => {
		const peaks = await slayer().fromArray(fft);
		return peaks.map((peak) => [peak.x, peak.y]);
	}, */
};

function maxima(peaks, magnitude = false) {
	if (magnitude) return threshold(peaks, magnitude);
	const average = peaks.reduce((sum, band) => sum + band[1], 0) / (peaks.length + 1);
	return threshold(peaks, average);
}

function fft(fft, mode, magnitude) {
	const peaks = filters[mode](fft);
	return maxima(peaks, magnitude);
}

module.exports = {filters, maxima, fft};
