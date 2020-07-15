const {existsSync, readFileSync, unlinkSync, mkdirSync} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const wav = require('node-wav');
const ft = require('fourier-transform');
// const {Xcorr} = require('abr-xcorr');
const Correlation = require('node-correlation');

const interval = 8192;
const rate = 44100;
const overlap = 2;

function stats(wav, filename) {
	console.log(wav.sampleRate, 'Hz,', wav.channelData.length, 'channels,', wav.channelData[0].length, 'samples.', filename);
}

function round(num) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function getAudio(input) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`ffmpeg -i "${input}" -ac 1 -ar ${rate} -vn "${tempfile}"`, {stdio: 'pipe'});
	const audio = wav.decode(readFileSync(tempfile));
	unlinkSync(tempfile);
	stats(audio, input.split('/').pop().split('\\').pop());
	return audio.channelData[0];
}

mkdirSync(resolve(__dirname, 'temp'), {recursive: true})

const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));
console.log();

const movies = [
	// resolve('./samples', 'Bare essentials of safety from Air New Zealand.mkv'),
	{file: 'Sintel (2010)-trailer.mkv', time: 'XXX'},
	{file: 'Batman Returns (1992).mkv', time: 7.5},
	{file: 'Indiana Jones and the Last Crusade (1989).mkv', time: 4.2},
	{file: 'Raiders of the Lost Ark (1981).mkv', time: 4.2},
	{file: 'Star Wars - Episode IV - A New Hope (1977).mkv', time: 6.9},
	{file: 'Indiana Jones and the Temple of Doom (1984) - 1.mkv', time: 7.5},
	{file: 'Indiana Jones and the Temple of Doom (1984) - 2.mkv', time: 5.3},
	{file: 'Indiana Jones and the Temple of Doom (1984) - 3.mkv', time: 10.5},
	{file: 'Star Wars - Episode V - The Empire Strikes Back (1980).mkv', time: 7.5},
	// {file: 'The Enemies Within (2016).mkv', time: 4734},
];

function fingerprint(wav) {
	let start = 0;
	const fingerprint = [];
	while (start + interval < wav.length) {
		let slice = wav.slice(start, start + interval);
		// slice = new Uint8Array(wav.slice(start, start + interval).buffer);
		let print = ft(slice);
		// print = print.slice(0, 10);
		fingerprint.push(print);
		// fingerprint.push(ft());
		start += interval / overlap;
	}
	return fingerprint;
}

const needle = fingerprint(wilhelm);

function compare(movie) {
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
			sample = bail * interval / overlap;
		}
	}
	const time = round(sample / rate);
	console.log('Best fit', round(best), 'at location', sample, 'time', time, 'seconds, expected', movie.time, 'seconds, delta ', round(Math.abs(time - movie.time)));
	console.log();
}

for (const movie of movies) {
	compare(movie);
}
