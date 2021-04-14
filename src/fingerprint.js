const slayer = require('slayer');
const ft = require('fourier-transform');
// var hamming = require('window-function/hamming');
const window = config.sample && config.sample.window ? require('window-function/' + config.sample.window) : null;
var applyWindow = require('window-function/apply');
const config = require('./config');

const square = (arr) => arr.map((element) => Math.pow(element, 2));

function normalise(array, value) {
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
}

async function subPrint(wav, threshold) {
	if (window) wav = applyWindow(wav, window);
	const fft = ft(wav);
	let peaks = await slayer().fromArray(fft);
	peaks = peaks.map((peak) => ({frequency: Math.round(peak.x * config.sample.rate / config.sample.size), magnitude: peak.y}));
	peaks = filter(normalise(peaks), threshold);
	return peaks;
}

async function fingerprint(wav, threshold, start = 0, length = 9999999) {
	let count = 0;
	const fingerprint = [];
	while (start + config.sample.size < wav.length && count < length) {
		let slice = wav.slice(start, start + config.sample.size);
		fingerprint.push(await subPrint(slice, threshold));
		start += config.sample.step;
		count++;
	}
	return fingerprint;
}

module.exports = fingerprint;
