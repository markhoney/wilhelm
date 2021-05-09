/**
 * Takes two FFT peaks and returns an array of the differences between them
 * @param {number[]} anchor The reference, or anchor, FTT peak - [time, frequency, amplitude]
 * @param {number[]} point The FFT peak to compare with the anchor
 * @param {string} mode How to relate the anchor and point. One of absolute, relative, fractional, differential or proportional
 * @returns FFT peak
 */
function createPrint(anchor, point, mode = 'differential') {
	if (mode === 'absolute') return [point[0], point[1], point[2]];
	else if (mode === 'relative') return [point[0] - anchor[0], point[1] - anchor[1], point[2] - anchor[2]];
	else if (mode === 'fractional') return [point[0] / anchor[0], point[1] / anchor[1], point[2] / anchor[2]];
	else if (mode === 'differential') return [(point[0] / anchor[0]) - 1, (point[1] / anchor[1]) - 1, (point[2] / anchor[2]) - 1];
	else if (mode === 'proportional') return [(anchor[0] - point[0]) / anchor[0], (anchor[1] - point[1]) / anchor[1], (anchor[2] - point[2]) / anchor[2]];
	else throw new Error('Invalid mode');
}

/**
 * Creates a fingerprint anchored around the loudest peak in the set of frequencies
 * @param {number[]} print A set of FFT peaks as [time, frequency, amplitude]
 * @param {string} mode A valid mode for the createPrint function
 * @returns {number[]} An array of the anchor and then the relative peaks
 */
function loudest(print, mode) {
	print = print.sort((a, b) => b[2] - a[2]);
	const anchor = print.shift();
	const zones = [];
	zones.push(anchor);
	while (print.length) {
		const point = print.pop();
		zones.push(createPrint(anchor, point, mode));
	}
	return zones;
}

function centreMultiple(print, {gap, points, mode}) {
	const zones = [];
	while (print.length > gap + points) {
		const anchor = print.shift();
		for (let i = gap; i < gap + points; i++) {
			zones.push([anchor.slice(0, 1), createPrint(anchor, point, mode)]); // [anchor[time, frequency], relative[time, frequency, magnitude]]
		}
	}
	return zones;
}

/**
 * Creates a fingerprint anchored around the centre peak in the set of frequencies
 * @param {number[]} print A set of FFT peaks as [time, frequency, amplitude]
 * @param {string} mode A valid mode for the createPrint function
 * @returns {number[]} An array of the anchor and then the relative peaks
 */
function centre(print, mode) {
	const mid = Math.floor(print.length / 2);
	const anchor = print.splice(mid, 1)[0];
	const zones = [];
	zones.push(anchor);
	while (print.length) {
		const point = print.pop();
		zones.push(createPrint(anchor, point, mode));
	}
	return zones;
}

/**
 * Creates a fingerprint anchored around the first peak in the set of frequencies
 * @param {number[]} print A set of FFT peaks as [time, frequency, amplitude]
 * @param {string} mode A valid mode for the createPrint function
 * @returns {number[]} An array of the anchor and then the relative peaks
 */

function zone(print, mode) {
	const zones = [];
	const anchor = print.shift();
	while (print.length) {
		const point = print.shift();
		zones.push([anchor[1], ...createPrint(anchor, point, mode)]);
	}
	return zones;
}

function zones(print, config) {
	const zones = [];
	while (print.length > config.gap + config.points) {
		const anchor = print.shift();
		for (let i = config.gap; i < config.gap + config.points; i++) {
			zones.push([anchor.slice(0, 1), createPrint(anchor, point, config.mode)]); // [anchor[time, frequency], relative[time, frequency, magnitude]]
		}
	}
	return zones;
}

module.exports = {
	loudest,
	create: createPrint,
	zones,
	centre,
};
