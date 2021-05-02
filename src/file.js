const {existsSync, readFileSync, writeFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const ffmpeg = require('ffmpeg-static');
const {execSync} = require('child_process');
const nodewav = require('node-wav');

function videoToAudioFile(input, sampleRate = 44100) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`${ffmpeg} -i "${input}" -ac 1 -ar ${sampleRate} -vn "${tempfile}"`, {stdio: 'pipe'});
	return tempfile;
}

function fileToWAV(input, remove = false) {
	const wav = readFileSync(input);
	if (remove) unlinkSync(input);
	return wav;
}

function wavToArray(wav) {
	return nodewav.decode(wav).channelData[0];
}

function wavFileToArray(input, remove) {
	const wav = fileToWAV(input, remove);
	return wavToArray(wav);
}

function fileToArray(filename, sampleRate) {
	const input = videoToAudioFile(filename, sampleRate);
	return wavFileToArray(input, true);
}

function arrayToWAV(input, sampleRate) {
	return nodewav.encode(input, {sampleRate, float: true, bitDepth: 32});
}

function wavToFile(wav, output) {
	output = resolve(output);
	if (!output.toLowerCase().endsWith('.wav')) output += '.wav';
	writeFileSync(output, wav);
	return output;
}

function arrayToFile(input, sampleRate, output) {
	const wav = arrayToWAV(input, sampleRate);
	return wavToFile(wav, output);
}

module.exports = {
	load: fileToArray,
	save: arrayToFile,
};
