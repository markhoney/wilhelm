// http://coding-geek.com/how-shazam-works/

// const slayer = require('slayer');
const ft = require('fourier-transform');
// var hamming = require('window-function/hamming');
var applyWindow = require('window-function/apply');

// const square = (arr) => arr.map((element) => Math.pow(element, 2));

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

function subPrint(wav, window) {
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
	const average = bands.reduce((sum, band) => sum + band[1], 0) / (bands.length + 1);
	// console.log(average, bands);
	return bands.filter((band) => band[1] >= average).reverse();
}

function audioPrint(wav, samplerate, samplesize, samplestep, window, start = 0, length = 9999999) {
	window = window ? require('window-function/' + window) : null;
	let count = 0;
	const fingerprint = [];
	while (start + samplesize < wav.length && count < length) {
		let slice = wav.slice(start, start + samplesize);
		fingerprint.push(subPrint(slice, window));
		start += samplestep;
		count++;
	}
	return fingerprint;
}

module.exports = audioPrint;
