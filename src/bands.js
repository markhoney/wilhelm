function filter(bands, max) {
	return bands.filter((band) => band[1] >= max);
}

function band(bins) {
	const bands = [];
	const limit = bins.length / 64;
	while (bins.length > limit) {
		const half = Math.ceil(bins.length / 2);
		const band = bins.splice(half);
		const max = Math.max(...band);
		const index = band.indexOf(max);
		bands.push([bins.length + index, max]);
	}
	return bands.reverse();
}

function subPrint(fft, magnitude) {
	const bands = band(fft);
	if (magnitude) return filter(bands, magnitude);
	const average = bands.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	return filter(bands, average);
}

module.exports = subPrint;
