const slayer = require('slayer');

function normalise(peaks) {
	peaks = peaks.filter((peak) => peak.frequency !== 0);
	const maxmagnitude = Math.max(...peaks.map((peak) => peak.magnitude));
	for (const peak of peaks) peak.magnitude = Math.round(peak.magnitude * (1000 / maxmagnitude)) / 1000;
	return peaks;
}

function filter(peaks, threshold) {
	return peaks
		.sort((a, b) => b.magnitude - a.magnitude)
		.filter((peak) => peak.magnitude > threshold);
}

async function peaks(fft, config) {
	let peaks = await slayer().fromArray(fft);
	peaks = peaks.map((peak) => ({frequency: Math.round(peak.x * config.sample.rate / (config.sample.size * 2)), magnitude: peak.y}));
	peaks = filter(normalise(peaks), config.filter.threshold);
	return peaks;
}

module.exports = peaks;
