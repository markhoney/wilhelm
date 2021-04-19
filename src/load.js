const {existsSync, readFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const {execSync} = require('child_process');
const nodewav = require('node-wav');

function extractAudio(input, samplerate = 44100) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`ffmpeg -i "${input}" -ac 1 -ar ${samplerate} -vn "${tempfile}"`, {stdio: 'pipe'});
	return tempfile;
}

function getWav(input, samplerate) {
	const tempfile = extractAudio(input, samplerate);
	const wav = readFileSync(tempfile);
	unlinkSync(tempfile);
	return wav;
}

function getAudio(input, samplerate) {
	const wav = getWav(input, samplerate);
	const audio = nodewav.decode(wav);
	return audio.channelData[0];
}

module.exports = getAudio;
