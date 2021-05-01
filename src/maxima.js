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

const slayer = require('slayer');

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

async function maximaOld(fft, config) {
	let maxima = methods[config.analyse.mode](fft);
	maxima = peaks.map((peak) => [Math.round(peak[0] * config.sample.rate / (config.sample.size * 2)), peak[1]]);
	maxima = filter(normalise(peaks), config.filter.threshold);
	return peaks;
}

function maxima(maxima, magnitude = false) {
	if (magnitude) return filter(maxima, magnitude);
	const average = bands.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	return filter(bands, average);
}

async function maximaMode(fft, mode = 'bands', magnitude = false) {
	let maxima = await methods[mode](fft);
	if (magnitude) return filter(maxima, magnitude);
	const average = bands.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	return filter(bands, average);
}

module.exports = {...methods, maxima};
