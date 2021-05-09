/**
 * Smooths an array by averaging several values
 * @param {number[]} array Fourier Transform
 * @param {number} width Number of values on either side to average over
 * @returns {number[]} Smoothed array
 */
function smoothArray(array, width) {
	return array.map((intensity, index, array) => {
		let start = index - width;
		if (start < 0) start = 0;
		const values = array.slice(start, index + width + 1);
		return values.reduce((a, b) => a + b) / values.length;
	});
}

/**
 * Takes a Fourier Transform and returns a list of peaks
 * @param {number[]} array Fourier Transform
 * @param {number} smooth Number of values on either side to average over
 * @returns {array[]} Set of peaks
 */
function detectPeaks(array, smooth = 0) {
	if (smooth) array = smoothArray(array, smooth);
	return array.reduce((peaks, intensity, index, array) => {
		if ((index === 0 || (array[index - 1] < intensity)) && (index === array.length - 1 || (array[index + 1] < intensity))) peaks.push([index, intensity]);
		return peaks;
	}, []);
}

/**
 * Returns a limited number of peak frequencies
 * @param {array[]} array Set of peaks
 * @param {number} limit Maximum number of peaks to return
 * @returns {array[]} Filtered set of peaks
 */
function limitPeaks(array, limit) {
	if (limit) array = array.sort((a, b) => b[1] - a[1]).slice(0, limit);
	return array.sort((a, b) => a[0] - b[0]);
}

/**
 * Removes all peaks under a threshold
 * @param {array[]} peaks Set of peaks
 * @param {number} threshold Maximum peak amplitude
 * @returns {array[]} Filtered set of peaks
 */
function threshold(peaks, threshold) {
	return peaks
		// .sort((a, b) => b.magnitude - a.magnitude)
		.filter((peak) => peak[1] > threshold);
}

const filters = {
	/**
	 * Finds the frequency with the largest amplitude in each of a set of frequency bands of a Fourier Transform
	 * @param {number[]} fft Fourier Transform array
	 * @param {number} limit Number of bands to create
	 * @returns {array[]} Set of frequencies and amplitudes
	 */
	bands(fft, limit = 10) {
		const bands = [];
		while (bands.length < limit - 1) {
			const half = Math.ceil(fft.length / 2);
			const band = fft.splice(half);
			const max = Math.max(...band);
			const index = band.indexOf(max);
			bands.push([fft.length + index, max]);
		}
		const max = Math.max(...fft);
		const index = fft.indexOf(max);
		bands.push([index, max]);
	return bands.reverse();
	},
	/**
	 * Finds the frequencies of a set of the largest peak amplitudes in a Fourier Transform
	 * @param {number[]} fft Fourier Transform array
	 * @param {number} limit Number of bands to create
	 * @param {number} smooth Smoothing factor for the array
	 * @returns {array[]} Set of frequencies and amplitudes
	 */
	peaks: (fft, limit = 10, smooth = 1) => {
		const peaks = detectPeaks(fft, smooth);
		return limitPeaks(peaks, limit);
	},
	/* peaks: async(fft, limit) => {
		const peaks = await slayer().fromArray(fft);
		return peaks.map((peak) => [peak.x, peak.y]);
	}, */
};

/**
 * Filters a set of peaks to return only the largest
 * @param {array[]} peaks Set of frequencies and amplitudes
 * @param {number} magnitude Maximum peak amplitude
 * @returns {array[]} Filtered set of peaks
 */
function maxima(peaks, magnitude = false) {
	if (magnitude) return threshold(peaks, magnitude);
	const average = peaks.reduce((sum, band) => sum + band[1], 0) / (peaks.length + 1);
	return threshold(peaks, average);
}

/**
 * Filters a Fourier Transform to only return the most significant frequencies and their amplitudes
 * @param {number[]} fft Fourier Transform array
 * @param {string} mode Which method to use for choosing the frequencies: bands or peaks
 * @param {number} limit A limit on the number of peaks that should be considered for inclusion
 * @param {number} magnitude Maximum peak amplitude
 * @returns {array[]} Filtered set of peaks
 */
function fft(fft, mode, limit, magnitude, ...args) {
	const peaks = filters[mode](fft, limit, ...args);
	return maxima(peaks, magnitude);
}

/**
 *
 * @param {array[]} stft An array of arrays of Fourier Transforms
 * @param {string} mode Which method to use for choosing the frequencies: bands or peaks
 * @param {number} magnitude Maximum peak amplitude
 * @param {number} limit A limit on the number of peaks that should be considered for inclusion
 * @returns {array[]} Filtered set of peaks
 * @returns
 */
function stft(stft, mode, limit, magnitude, ...args) {
	return stft.map((transform) => fft(transform, mode, limit, magnitude, ...args));
}

function callback(mode, limit, magnitude, ...args) {
	return (fft) => {
		const peaks = filters[mode](fft, limit, ...args);
		return maxima(peaks, magnitude);
	};
}

/**
 * Flattens an array of stft peaks, prepending the index to each
 * @param {array[]} stft Array of stft groups of peaks
 * @returns {array[]} Flat array of peaks as [index, frequency, magnitude]
 */
 function flatten(stft) {
	// console.log(stft);
	return stft.map((peaks, index) => peaks.map((peak) => [index, ...peak])).flat();
}



module.exports = {filters, maxima, fft, stft, flatten, callback};
