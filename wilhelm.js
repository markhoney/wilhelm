const {existsSync, readFileSync, unlinkSync, createReadStream} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const nodewav = require('node-wav');
const wav = require('wav');
const slayer = require('slayer');
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

async function analyse() {
	const needle = resolve('./samples', 'Wilhelm_Scream.ogg');
	// const needle = resolve('./samples', 'Wilhelm_tk4.wav');
	// const needle = resolve('./samples', 'The_Howie_Long_Scream.ogg');
	// const needle = resolve('./samples', 'uniphone.wav');
	// const needle = resolve('./samples', 'castlethunder.wav');
	// const needle = resolve('./samples', "John_Weissmuller's_MGM_Tarzan_Yell.ogg");
	const file = createReadStream(extractAudio(needle));
	const reader = new wav.Reader();
	// const wav = getAudio(needle);
	file.pipe(reader).pipe(analyser);
}

analyse();
