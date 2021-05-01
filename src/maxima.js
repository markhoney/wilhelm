const slayer = require('slayer');

function normalise(peaks) {
	peaks = peaks.filter((peak) => peak.frequency !== 0);
	const maxmagnitude = Math.max(...peaks.map((peak) => peak.magnitude));
	for (const peak of peaks) peak.magnitude = Math.round(peak.magnitude * (1000 / maxmagnitude)) / 1000;
	return peaks;
}

function filter(peaks, threshold) {
	return peaks
		// .sort((a, b) => b.magnitude - a.magnitude)
		.filter((peak) => peak[1] > threshold);
}

const methods = {
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

function filterMaxima(peaks, magnitude = false) {
	if (magnitude) return filter(peaks, magnitude);
	const average = peaks.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	return filter(bands, average);
}

async function fftToMaxima(fft, mode, magnitude) {
	const peaks = await methods[mode](fft);
	return filterMaxima(peaks, magnitude);
}


module.exports = {...methods, maxima};
