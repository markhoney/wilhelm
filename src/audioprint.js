// http://coding-geek.com/how-shazam-works/

// const slayer = require('slayer');
const ft = require('fourier-transform');
// var hamming = require('window-function/hamming');
var applyWindow = require('window-function/apply');

// const square = (arr) => arr.map((element) => Math.pow(element, 2));

/* function normalise(array, value) {
	const ratio = Math.max.apply(Math, array) / value;
	return array.map((element) => element / ratio);
}

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
} */

function subPrint(wav, window, magnitude) {
	if (window) wav = applyWindow(wav, window);
	const bins = ft(wav);
	const bands = [];
	const limit = bins.length / 64;
	while(bins.length > limit) {
		const half = Math.ceil(bins.length / 2);
		const band = bins.splice(half);
		const max = Math.max(...band);
		const index = band.indexOf(max);
		bands.push([index + bins.length, max]);
	}
	if (magnitude) return bands.filter((band) => band[1] >= 0.01).reverse().map((band) => band[0]);
	const average = bands.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	return bands.filter((band) => band[1] >= average).reverse().map((band) => band[0]);
}

function audioPrint(wav, config, start = 0, length = 9999999) {
	const window = config.sample.window ? require('window-function/' + config.sample.window) : null;
	let count = 0;
	const fingerprint = [];
	while (start + config.sample.size < wav.length && count < length) {
		let slice = wav.slice(start, start + config.sample.size);
		// const mid = start + (samplesize / 2);
		// const time = Math.floor((start + (samplesize / 2)) / samplesize);
		// const time = Math.floor((start + (samplesize / 2)) * 1000 / samplerate);
		const time = Math.floor(start * 1000 / config.sample.rate);
		// const bands = subPrint(slice, window).map((freq) => [time, freq]);
		const bands = subPrint(slice, window, config.print.magnitude).map((freq) => [time, Math.round(freq * config.sample.rate / (config.sample.size * 2))]);
		fingerprint.push(...bands);
		start += config.sample.step;
		count++;
	}
	return fingerprint;
}

function zonesDict(wav, config) {
	const print = audioPrint(wav, config);
	const zones = {};
	while (print.length > config.print.gap + config.print.points) {
		const anchor = print.shift();
		for (let i = gap; i < config.print.gap + config.print.points; i++) {
			// if (!zones[anchor[0]]) zones[anchor[0]] = {};
			// if (!zones[anchor[0]][anchor[1]]) zones[anchor[0]][anchor[1]] = [print[i][1], print[i][0] - anchor[0]];
			// zones[`${anchor[1]}|${print[i][1]}|${print[i][0] - anchor[0]}`] = anchor[0];
		}
	}
	return zones;
}

function centreZonesArray(wav, config) {
	const print = audioPrint(wav, config);
	const zones = [];
	while (print.length > config.print.gap + config.print.points) {
		const anchor = print.shift();
		for (let i = gap; i < config.print.gap + config.print.points; i++) {
			zones.push([anchor[0], anchor[1], print[i][1], print[i][0] - anchor[0]]);
		}
	}
	return zones;
}

function centreZoneArray(wav, config) {
	const print = audioPrint(wav, config);
	// console.log(print);
	const mid = Math.floor(print.length / 2);
	const anchor = print.splice(mid, 1)[0];
	const zones = [];
	zones.push(anchor);
	while (print.length) {
		const point = print.pop();
		zones.push([point[0] - anchor[0], point[1]]);
	}
	return zones;
}

function zoneArray(wav, config) {
	const print = audioPrint(wav, config);
	const zones = [];
	const anchor = print.shift();
	while (print.length) {
		const point = print.shift();
		zones.push([anchor[1], point[1], point[0] - anchor[0]]);
	}
	return zones;
}

function zonesArray(wav, config) {
	const print = audioPrint(wav, config);
	const zones = [];
	while (print.length > config.print.gap + config.print.points) {
		const anchor = print.shift();
		for (let i = config.print.gap; i < config.print.gap + config.print.points; i++) {
			zones.push([anchor[0], anchor[1], print[i][1], print[i][0] - anchor[0]]);
		}
	}
	return zones;
}

module.exports = {
	print: audioPrint,
	zones: zonesArray,
	centre: centreZoneArray,
};
