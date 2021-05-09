function scalePeak(peak, rate, size) {
	const scaled = [peak.pop() * 100];
	scaled.unshift(peak.pop() * rate * 0.5 / size);
	if (peak.length) scaled.unshift(peak.pop() * 1000 / rate);
	return scaled;
}

function scalePeakOld(peak, rate, size) {
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
