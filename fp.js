const {existsSync, readFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const wav = require('node-wav');
const ft = require('fourier-transform');
const Correlation = require('node-correlation');

function stats(wav, filename) {
	console.log(wav.sampleRate, 'Hz,', wav.channelData.length, 'channels,', wav.channelData[0].length, 'samples.', filename);
}

function getAudio(input) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`ffmpeg -i "${input}" -ac 1 -ar 44100 -vn "${tempfile}"`, {stdio: 'pipe'});
	const audio = wav.decode(readFileSync(tempfile));
	unlinkSync(tempfile);
	stats(audio, input.split('/').pop().split('\\').pop());
	return audio;
}

const wilhelm = getAudio(resolve('./samples', 'Wilhelm_Scream.ogg'));

// const moviefile = resolve('./samples', 'Batman Returns (1992).mkv');
const moviefile = resolve('./samples', 'Indiana Jones and the Last Crusade (1989).mkv');
// const moviefile = resolve('./samples', 'Bare essentials of safety from Air New Zealand.mkv');

const movie = getAudio(moviefile);

const size = Math.pow(2, 15);
// const needle = new Uint8Array(wilhelm.channelData[0].slice(2048, 2048 + size).buffer);
const needle = ft(wilhelm.channelData[0].slice(2048, 2048 + size));
// const needle = ft(new Uint8Array(wilhelm.channelData[0].slice(2048, 2048 + size).buffer));
let start = 0;
let best = 0;
let sample = 0;

while (start + size < movie.channelData[0].length) {
	// const haystack = new Uint8Array(movie.channelData[0].slice(start, start + size).buffer);
	const haystack = ft(movie.channelData[0].slice(start, start + size));
	// const haystack = ft(new Uint8Array(movie.channelData[0].slice(start, start + size).buffer));
	// const correlation = Xcorr(needle, haystack).xcorrMax;
	// console.log('Needle', ft(needle));
	// console.log('Haystack', ft(haystack));
	const correlation = Correlation.calc(needle, haystack);
	if (correlation > best) {
		best = correlation;
		sample = start;
	}
	start += size / 8;
}

console.log('Best fit', best, 'at location', sample);
