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

function getAudio(input) {
	const tempfile = extractAudio(input);
	const audio = nodewav.decode(readFileSync(tempfile));
	unlinkSync(tempfile);
	return audio.channelData[0];
}

module.exports = getAudio;
