const {existsSync, readFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const wav = require('node-wav');
const ft = require('fourier-transform');
const Correlation = require('node-correlation');
const {DFT, FFT} = require('dsp.js');
const dft = require("dft-easy");
const stft = require("stft");
// const normalise = require('array-normalize');
const chart = require('./svg');

const samplerate = 44100;
// const samplesize = 8192;
const samplesize = 8192;
const samplestep = 4410;
// const overlap = 2;

function stats(wav, filename) {
	console.log(wav.sampleRate, 'Hz,', wav.channelData.length, 'channels,', wav.channelData[0].length, 'samples.', filename);
}

function round(num) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function getAudio(input) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`ffmpeg -i "${input}" -ac 1 -ar ${samplerate} -vn "${tempfile}"`, {stdio: 'pipe'});
	const audio = wav.decode(readFileSync(tempfile));
	unlinkSync(tempfile);
	stats(audio, input.split('/').pop().split('\\').pop());
	return audio.channelData[0];
}

function fourier(wav) {
	return ft(wav); // .slice(0, 20);
}

function fingerprint(wav, length = 9999999) {
	let start = 0;
	let count = 0;
	const fingerprint = [];
	while (start + samplesize < wav.length && count < length) {
		let slice = wav.slice(start, start + samplesize);
		const print = fourier(slice);
		// fingerprint.push(print);
		fingerprint.push(maxPos(print));
		start += samplestep;
		count++;
	}
	return fingerprint;
}

function wilhelmPrint() {
	const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));
	const start = 2048;
	chart(ft(wilhelm.slice(start, start + Math.pow(2, 15))));
}

function compareArrays(hay, needle) {
	let correlation = 0;
	for (let straw = 0; straw < needle.length; straw++) {
		if (hay[straw] && needle[straw]) correlation += Correlation.calc(hay[straw].slice(0, 4000), needle[straw].slice(0, 4000));
	}
	return correlation;
}

function maxPos(arr) {
	return arr.indexOf(Math.max(...arr));
}

function compare(hay, needle) {
	let correlation = 0;
	for (let straw = 0; straw < needle.length; straw++) {
		if (hay[straw] && needle[straw]) correlation += Math.abs(hay[straw] - needle[straw]);
	}
	return correlation;
}

function rolling(needle, haystack) {
	needle = fingerprint(getAudio(needle));
	haystack = getAudio(haystack);
	const hay = fingerprint(haystack, needle.length);
	let start = needle.length * samplestep;
	let best = 0;
	let sample = 0;
	const now = Date.now();
	while (start + samplestep + samplesize < haystack.length) {
		const correlation = compare(hay, needle);
		if (correlation > best) {
			best = correlation;
			sample = start - (needle.length * samplestep);
		}
		hay.shift();
		start += samplestep;
		let slice = haystack.slice(start, start + samplesize);
		// hay.push(fourier(slice));
		hay.push(maxPos(fourier(slice)));
	}
	const delta = round((Date.now() - now) / 1000);
	let timecode = round(sample / samplerate);
	// if (best < 3) timecode = -999;
	return {score: best, timecode, delta};
}

function compareMovie(movie) {
	const wav = getAudio(resolve('./test', movie.file));
	const haystack = fingerprint(wav);
	let best = 0;
	for (let bail = 0; bail < haystack.length; bail++) {
		let correlation = 0;
		for (let straw = 0; straw < needle.length; straw++) {
			// console.log(haystack[bail + straw]);
			// console.log(needle[straw]);
			if (haystack[bail + straw] && needle[straw]) correlation += Correlation.calc(haystack[bail + straw], needle[straw]);
		}
		if (correlation > best) {
			best = correlation;
			sample = bail * samplestep;
		}
	}
	const time = round(sample / samplerate);
	console.log('Best fit', round(best), 'at location', sample, 'time', time, 'seconds, expected', movie.time, 'seconds, delta ', round(Math.abs(time - movie.time)));
	console.log();
}

function dfteasy() {
	const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));
	console.log(dft(wilhelm.map((value, index) => ([index, value]))));
}

function fftcalc() {
	const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));
	const start = 2048;
	const size = Math.pow(2, 15);
	let slice = wilhelm.slice(start, start + size);
	// slice = new Uint8Array(slice);
	const fft = new FFT(size, samplerate);
	fft.forward(slice);
	console.log(fft.spectrum);
}

function stftcalc() {
	stft(1, 8192, (data) => {

	}, {hop_size: 4410});
}

function movies() {
	const movies = require('./tests.json');
	const needle = resolve('./samples', 'Wilhelm_Scream.ogg');
	for (const movie of movies) {
		if (movie.file) {
			const haystack = resolve(movie.folder || './test', movie.file);
			const results = rolling(needle, haystack);
			console.log();
			console.log('Best fit', round(results.score), 'at', results.timecode, 'seconds, expected', movie.time, 'seconds - delta', round(Math.abs(results.timecode - movie.time)), 'seconds. Took', results.delta, 'seconds to process.');
			console.log();
		}
	}
}

movies();
// wilhelmPrint();
// dfteasy();
// fft();
// stftcalc();
