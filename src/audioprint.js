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
	return bands.filter((band) => band[1] >= average).reverse().map((band) => band[0]);
}

function audioPrint(wav, samplesize, samplestep, window, start = 0, length = 9999999) {
	window = window ? require('window-function/' + window) : null;
	let count = 0;
	const fingerprint = [];
	while (start + samplesize < wav.length && count < length) {
		let slice = wav.slice(start, start + samplesize);
		// const mid = start + (samplesize / 2);
		const mid = Math.floor((start + (samplesize / 2)) / samplesize);
		const bands = subPrint(slice, window).map((freq) => [mid, freq]);
		fingerprint.push(...bands);
		start += samplestep;
		count++;
	}
	return fingerprint;
}

function zoneDict(wav, samplesize, samplestep, window, gap = 0, points = 5) {
	const print = audioPrint(wav, samplesize, samplestep, window);
	const zones = {};
	while(print.length > gap + points) {
		const anchor = print.shift();
		for (let i = gap; i < gap + points; i++) {
			if (!zones[anchor[0]]) zones[anchor[0]] = {};
			if (!zones[anchor[0]][anchor[1]]) zones[anchor[0]][anchor[1]] = [print[i][1], print[i][0] - anchor[0]];
		}
	}
	return zones;
}

function zones(wav, samplesize, samplestep, window, gap = 0, points = 5) {
	const print = audioPrint(wav, samplesize, samplestep, window);
	const zones = [];
	while(print.length > gap + points) {
		const anchor = print.shift();
		for (let i = gap; i < gap + points; i++) {
			zones.push([anchor[0], anchor[1], print[i][1], print[i][0] - anchor[0]]);
		}
	}
	return zones;
}

module.exports = zones;
