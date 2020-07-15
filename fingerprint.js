const {existsSync, readFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const wav = require('node-wav');
const ft = require('fourier-transform');
const chart = require('./svg');

const samplerate = 44100;
const samplesize = 8192;
// const samplesize = 16384;
// const samplestep = 4410;
const samplestep = 100;
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
	// stats(audio, input.split('/').pop().split('\\').pop());
	return audio.channelData[0];
}

function subPrint(wav) {
	return maxPos(ft(wav).slice(100, 1000));
}

function fingerprint(wav, start = 0, length = 9999999) {
	let count = 0;
	const fingerprint = [];
	while (start + samplesize < wav.length && count < length) {
		let slice = wav.slice(start, start + samplesize);
		fingerprint.push(subPrint(slice));
		start += samplestep;
		count++;
	}
	return fingerprint;
}

function maxPos(arr) {
	return arr.indexOf(Math.max(...arr));
}

function compare(hay, needle) {
	let correlation = 0;
	for (let straw = 0; straw < needle.length; straw++) {
		correlation += Math.abs(hay[straw] - needle[straw]);
	}
	return correlation;
}

function dateDelta(now) {
	// const now = Date.now();
	return round((Date.now() - now) / 1000);
}

function rolling(needle, haystack, expected) {
	needle = fingerprint(getAudio(needle));
	// console.log('Needle:', needle);
	let now = Date.now();
	haystack = getAudio(haystack);
	const loadTime = dateDelta(now);
	now = Date.now();
	// console.log('Looking for:', fingerprint(haystack, samplerate * expected, needle.length));
	const hay = fingerprint(haystack, 0, needle.length);
	let start = needle.length * samplestep;
	const results = {score: 999999, sample: 0};
	let fp = hay.slice();
	while (start + samplestep + samplesize < haystack.length) {
		const correlation = compare(hay, needle);
		if (correlation < results.score) {
			results.score = correlation;
			results.sample = start - (needle.length * samplestep);
			fp = hay.slice();
		}
		hay.shift();
		start += samplestep;
		let slice = haystack.slice(start, start + samplesize);
		hay.push(subPrint(slice));
	}
	const processTime = dateDelta(now);
	let timecode = round(results.sample / samplerate);
	// console.log('Found:', fp);
	return {...results, timecode, loadTime, processTime};
}

function movies() {
	const movies = require('./tests.json');
	const needle = resolve('./samples', 'Wilhelm_Scream.ogg');
	for (const movie of movies) {
		if (movie.file) {
			const haystack = resolve(movie.folder || './test', movie.file);
			const results = rolling(needle, haystack, movie.time);
			console.log('Best fit', round(results.score), 'at', results.timecode, 'seconds, expected', movie.time, 'seconds - delta', round(Math.abs(results.timecode - movie.time)), 'seconds. Took', results.delta, 'seconds to process.');
		}
	}
}

movies();
