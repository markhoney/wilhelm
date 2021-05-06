function scalePeak(peak, rate, size) {
	return [
		Math.floor(peak[0] * 1000 / rate),
		Math.floor(peak[1] * rate * 0.5 / size),
		peak[2] * 100,
	];
}

function scalePeaks(peaks, rate, size) {
	return peaks.map((peak) => scalePeak(peak, rate, size));
}

module.exports = {peak: scalePeak, peaks: scalePeaks};
