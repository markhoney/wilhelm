const {existsSync, readFileSync, unlinkSync, createReadStream} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const nodewav = require('node-wav');
const wav = require('wav');
const slayer = require('slayer');
const ft = require('fourier-transform');
const windowing = require('fft-windowing');
var hamming = require('window-function/hamming');
var applyWindow = require('window-function/apply');
const shortTimeFT = require("stft");
const chart = require('./svg');

const Analyser = require('audio-analyser');
const analyser = new Analyser();
analyser.on('data', function () {
	const freq = this.getFrequencyData();
	console.log(freq);
	console.log(Math.max(...freq));
	console.log(freq.indexOf(Math.max(...freq)));
});

const samplerate = 44100;
const samplestep = 2205;
const samplesize = 4096;

function round(num) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function dateDelta(now) {
	return round((Date.now() - now) / 1000);
}

function extractAudio(input) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`ffmpeg -i "${input}" -ac 1 -ar ${samplerate} -vn "${tempfile}"`, {stdio: 'pipe'});
	return tempfile;
}

function getAudio(input) {
	const tempfile = extractAudio(input);
	const audio = nodewav.decode(readFileSync(tempfile));
	unlinkSync(tempfile);
	return audio.channelData[0];
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
	const fft = ft(applyWindow(wav, hamming));
	let peaks = await slayer().fromArray(fft);
	peaks = peaks.map((peak) => ({frequency: Math.round(peak.x * samplerate / samplesize), magnitude: peak.y}));
	peaks = filter(normalise(peaks), threshold);
	return peaks;
}

async function fingerprint(wav, threshold, start = 0, length = 9999999) {
	let count = 0;
	const fingerprint = [];
	while (start + samplesize < wav.length && count < length) {
		let slice = wav.slice(start, start + samplesize);
		fingerprint.push(await subPrint(slice, threshold));
		start += samplestep;
		count++;
	}
	return fingerprint;
}

function compare(hay, needle) {
	let correlation = 0;
	for (let straw = 0; straw < needle.length; straw++) {
		// correlation += Math.abs(hay[straw] - needle[straw]);
		let matches = [];
		for (const peak of needle[straw]) {
			const match = {needle: peak, straw: {frequency: -999999, magnitude: 0}};
			for (const contender of hay[straw]) {
				if (Math.abs(peak.frequency - contender.frequency) < Math.abs(peak.frequency - match.straw.frequency)) match.straw = contender;
			}
			matches.push(match);
		}
		matches = normalise(matches);
		for (const match of matches) {
			const freqdiff = Math.abs(match.needle.frequency - match.straw.frequency);
			const magdiff = Math.abs(match.needle.magnitude - match.straw.magnitude);
			correlation += freqdiff + (magdiff * match.needle.frequency);
		}
	}
	return correlation;
}

async function rolling(needle, haystack) {
	const threshold = 0.1;
	needle = await fingerprint(getAudio(needle), 0.4);
	let now = Date.now();
	haystack = getAudio(haystack);
	const loadTime = dateDelta(now);
	now = Date.now();
	const hay = await fingerprint(haystack, threshold, 0, needle.length);
	let start = needle.length * samplestep;
	const results = {score: 999999, sample: 0};
	while (start + samplestep + samplesize < haystack.length) {
		const correlation = compare(hay, needle);
		if (correlation < results.score) {
			results.score = correlation;
			results.sample = start - (needle.length * samplestep);
		}
		hay.shift();
		start += samplestep;
		let slice = haystack.slice(start, start + samplesize);
		hay.push(await subPrint(slice, threshold));
	}
	const processTime = dateDelta(now);
	let timecode = round(results.sample / samplerate);
	return {...results, timecode, loadTime, processTime};
}

async function analyse() {
	const movies = require('./tests.json');
	// const needle = resolve('./samples', 'Wilhelm_Scream.ogg');
	const needle = resolve('./samples', 'Wilhelm_tk4.wav');
	// const needle = resolve('./samples', 'The_Howie_Long_Scream.ogg');
	// const needle = resolve('./samples', 'uniphone.wav');
	// const needle = resolve('./samples', 'castlethunder.wav');
	// const needle = resolve('./samples', "John_Weissmuller's_MGM_Tarzan_Yell.ogg");
	// const wav = getAudio(needle);
	// const file = createReadStream(extractAudio(needle));
	// const reader = new wav.Reader();
	// file.pipe(reader).pipe(analyser);
	// console.log(await fingerprint(getAudio(needle), 0.4));
	for (const movie of movies) {
		if (movie.file) {
			const haystack = resolve(movie.folder || './test', movie.file);
			const results = await rolling(needle, haystack);
			console.log('Best fit', round(results.score), 'at', results.timecode, 'seconds, expected', movie.time, 'seconds. Delta', round(Math.abs(results.timecode - movie.time)), 'seconds. Took', results.loadTime, 'seconds to load,', results.processTime, 'seconds to process:', movie.file);
		}
	}
}

analyse();
