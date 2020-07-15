const {existsSync, readFileSync, writeFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const wav = require('node-wav');
const ft = require('fourier-transform');
const Correlation = require('node-correlation');
const vega = require('vega');
const {DFT, FFT} = require('dsp.js');
const dft = require("dft-easy");
const stft = require("stft");
// const normalise = require('array-normalize');

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
		let print = fourier(slice);
		fingerprint.push(print);
		start += samplestep;
		count++;
	}
	return fingerprint;
}

function chart(wave) {
	// console.log(wave);
	const values = ft(wave).map((value, index) => ({x: index, y: value}));
	// console.log(values);
	const chart = {
		$schema: 'https://vega.github.io/schema/vega/v5.json',
		description: 'Wilhelm Scream Frequency distribution',
		width: 400,
		height: 200,
		padding: 5,
		data: [{name: 'table', values}],
		signals: [
			{
				name: 'interpolate',
				value: 'linear',
				bind: {
					input: "select",
					options: [
						"basis",
						"cardinal",
						"catmull-rom",
						"linear",
						"monotone",
						"natural",
						"step",
						"step-after",
						"step-before",
					],
				},
			},
		],
		scales: [
			{
				name: 'xscale',
				type: 'linear',
				range: 'width',
				nice: true,
				zero: false,
				domain: {
					data: 'table',
					field: 'x',
				},
			},
			{
				name: 'yscale',
				type: 'linear',
				range: 'height',
				nice: true,
				zero: true,
				domain: {
					data: 'table',
					field: 'y',
				},
			},
		],
		axes: [
			{
				orient: 'bottom',
				scale: 'xscale',
				tickCount: 10,
			},
			{
				orient: 'left',
				scale: 'yscale',
			},
		],
		marks: [
			{
				type: 'line',
				from: {
					data: 'table',
				},
				encode: {
					enter: {
						x: {
							scale: 'xscale',
							field: 'x',
						},
						y: {
							scale: 'yscale',
							field: 'y',
						},
					},
				},
			},
		],
	};
	const view = new vega.View(vega.parse(chart), {renderer: 'none'});
	view.toSVG().then((svg) => writeFileSync('wilhelm.svg', svg));
}

function wilhelmPrint() {
	const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));
	const start = 2048;
	chart(wilhelm.slice(start, start + Math.pow(2, 15)));
}

function compare(hay, needle) {
	let correlation = 0;
	for (let straw = 0; straw < needle.length; straw++) {
		if (hay[straw] && needle[straw]) correlation += Correlation.calc(hay[straw].slice(0, 4000), needle[straw].slice(0, 4000));
	}
	return correlation;
}

function rolling(haystack, expected) {
	const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));
	const needle = fingerprint(wilhelm);
	console.log();
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
		hay.push(fourier(slice));
	}
	const delta = round((Date.now() - now) / 1000);
	let time = round(sample / samplerate);
	if (best < 3) time = -999;
	console.log('Best fit', round(best), 'at', time, 'seconds, expected', expected, 'seconds - delta', round(Math.abs(time - expected)), 'seconds. Took', delta, 'seconds to process.');
	console.log();
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
	const movies = [
		{file: 'Bare essentials of safety from Air New Zealand.mkv', time: -999},
		{file: 'Sintel (2010)-trailer.mkv', time: -999},
		{file: 'Batman Returns (1992).mkv', time: 7.4},
		{file: 'Indiana Jones and the Last Crusade (1989).mkv', time: 4.2},
		{file: 'Raiders of the Lost Ark (1981).mkv', time: 4.4},
		{file: 'Star Wars - Episode IV - A New Hope (1977).mkv', time: 6.8},
		{file: 'Indiana Jones and the Temple of Doom (1984) - 1.mkv', time: 7.8},
		{file: 'Indiana Jones and the Temple of Doom (1984) - 2.mkv', time: 5.6},
		{file: 'Indiana Jones and the Temple of Doom (1984) - 3.mkv', time: 10.5},
		{file: 'Star Wars - Episode V - The Empire Strikes Back (1980).mkv', time: 7.7},
		// {file: 'The Enemies Within (2016).mkv', time: 4735},
	];
	for (const movie of movies) {
		// compareMovie(movie);
		const haystack = getAudio(resolve('./test', movie.file));
		rolling(haystack, movie.time);
	}
}

movies();
// wilhelmPrint();
// dfteasy();
// fft();
// stftcalc();
