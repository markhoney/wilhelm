const slayer = require('slayer');

function smooth(fft, width) {
	return fft.map((frequency, index) => {
		let sum = frequency;
		for (let i = 1; i <= width; i++) {
			sum += fft[index + i] ?? frequency;
			sum += fft[index - i] ?? frequency;
		}
		return sum / (width * 2) + 1;
	});
	return fft.map((frequency, index) => {
		const values = fft.slice(index - width, index + width);
		return values.reduce((a, b) => a + b) / values.length;
	});
}

function detectPeaks(fft) {

}

function threshold(peaks, threshold) {
	return peaks
		// .sort((a, b) => b.magnitude - a.magnitude)
		.filter((peak) => peak[1] > threshold);
}

const filters = {
	bands(fft, limit) {
		const bands = [];
		while (bands.length < limit) {
			const half = Math.ceil(fft.length / 2);
			console.log(half);
			const band = fft.splice(half);
			const max = Math.max(...band);
			const index = band.indexOf(max);
			bands.push([fft.length + index, max]); //
		}
		return bands.reverse();
	},
	peaks: async(fft, limit) => {
		const peaks = await slayer().fromArray(fft);
		return peaks.map((peak) => [peak.x, peak.y]);
	},
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
