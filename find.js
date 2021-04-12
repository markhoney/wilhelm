const {existsSync, readFileSync, unlinkSync, createReadStream} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const nodewav = require('node-wav');
// const wav = require('wav');
const slayer = require('slayer');
const ft = require('fourier-transform');
// const windowing = require('fft-windowing');
var hamming = require('window-function/hamming');
var applyWindow = require('window-function/apply');
// const shortTimeFT = require("stft");
// const chart = require('./svg');
// const asciichart = require('asciichart');
const babar = require('babar');
// const config = require('./config');

const Analyser = require('audio-analyser');
const analyser = new Analyser();
analyser.on('data', function () {
	const freq = this.getFrequencyData();
	console.log(freq);
	console.log(Math.max(...freq));
	console.log(freq.indexOf(Math.max(...freq)));
});

function round(num) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function dateDelta(now) {
	return round((Date.now() - now) / 1000);
}

function extractAudio(input) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`ffmpeg -i "${input}" -ac 1 -ar ${config.sample.rate} -vn "${tempfile}"`, {stdio: 'pipe'});
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
	if (config.chart && config.chart.height) {
		console.clear();
		console.log(babar(normalise(fft).map((value, index) => [index, value]), {width: config.chart.width || 80, height: config.chart.height || 40}));
	}
	let peaks = await slayer().fromArray(fft);
	peaks = peaks.map((peak) => ({frequency: Math.round(peak.x * config.sample.rate / config.sample.size), magnitude: peak.y}));
	peaks = filter(normalise(peaks), threshold);
	// console.log(peaks);
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
	return correlation / needle.length;
}

async function rolling(needle, haystack) {
	needle = await fingerprint(getAudio(needle), config.peak.threshold);
	let now = Date.now();
	haystack = getAudio(haystack);
	const seconds = round(haystack.length / config.sample.rate);
	const loadTime = dateDelta(now);
	now = Date.now();
	const hay = await fingerprint(haystack, config.peak.threshold / config.peak.ratio, 0, needle.length);
	let start = needle.length * config.sample.step;
	const results = {score: 999999, sample: 0};
	while (start + config.sample.step + config.sample.size < haystack.length) {
		const correlation = compare(hay, needle);
		if (correlation < results.score) {
			results.score = correlation;
			results.sample = start - (needle.length * config.sample.step);
		}
		hay.shift();
		start += config.sample.step;
		let slice = haystack.slice(start, start + config.sample.size);
		hay.push(await subPrint(slice, config.peak.threshold / config.peak.ratio));
	}
	const processTime = dateDelta(now);
	let timecode = round(results.sample / config.sample.rate);
	return {...results, seconds, timecode, loadTime, processTime};
}

function pad(value) {
	return value.toString().padEnd(config.console.pad, ' ');
}

function line(values) {
	return values.map((value) => pad(value)).join('');
}

function lines(values) {
	return [line(Object.keys(values)), line(Object.values(values))].join('\n');
}

async function analyse(needle, haystack, expected) {
	const results = await rolling(needle, haystack);
	if (expected) {
		results.expected = expected;
		results.delta = Math.abs(results.timecode - results.expected);
	}
	results.rate = results.seconds / (results.loadTime + results.processTime);
	// results.haystack = movie.file.replace('.mkv', '');
	results.haystack = haystack.split('.').slice(0, -1).join('.');
	return results;
}

const defaults = {
	expected: 0,
	sample: {
		rate: 44100,
		step: 4410,
		size: 8192,
	},
	peak: {
		threshold: 0.4,
		ratio: 2,
	},
	chart: {
		width: 120,
		height: 20,
	},
	console: {
		pad: 10,
	},
	test: false,
};

const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const config = yargs(hideBin(process.argv))
	.default(defaults)
	// .config({extends: './config.json'})
	.config('config', (path) => existsSync(resolve(path)) ? require(path) : existsSync(resolve('./config.js')) || existsSync(resolve('./config.json')) ? require('./config') : {})
	.usage('Usage: $0 --options [input] [output]')
	.demandCommand(2)
	.boolean('chart')
	.boolean('console')
	.boolean('test')
	// .completion()
	.argv;

// console.log(config);

module.exports = analyse;

async function commandline() {
	const headers = {
		score: 'Best fit',
		sample: 'Sample',
		seconds: 'Length',
		timecode: 'Timecode',
		expected: 'Expected',
		delta: 'Delta',
		length: 'Length',
		loadTime: 'Load',
		processTime: 'Process',
		rate: 'Rate',
		haystack: 'File',
	};
	config.needle = resolve(config._[0]);
	if (!existsSync(config.needle)) {
		console.error(`Could not find needle file (expected ${config.needle})`);
		return;
	}
	config.haystack = resolve(config._[1]);
	if (!existsSync(config.haystack)) {
		console.error(`Could not find haystack file (expected ${config.haystack})`);
		return;
	}
	const results = await analyse(config.needle, config.haystack, config.expected);
	console.log(results);
	results.delta = round(results.delta) + 's';
	results.rate = round(results.rate) + 'x';
	results.score = round(results.score);
	results.timecode += 's';
	results.expected = config.expected + 's';
	results.loadTime += 's';
	results.processTime += 's';
	results.haystack = config.haystack.split('.').slice(0, -1).join('.');
	if (config.console !== false) {
		const summary = Object.keys(results).reduce((stats, stat) => ({...stats, [headers[stat]]: results[stat]}), {});
		console.info(lines(summary));
	}
}

if (require.main === module) {
	config.command = true;
	commandline();
}
