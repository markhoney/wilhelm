const {existsSync, readFileSync, writeFileSync, unlinkSync} = require('fs');
const {resolve} = require('path');
const ffmpeg = require('ffmpeg-static');
const {execSync} = require('child_process');
const nodewav = require('node-wav');

/**
 * Extracts the audio, as a wav file, from a media file (audio or video)
 * @param {string} input Path to the media file
 * @param {number} sampleRate The sample rate of the output wav file
 * @returns {string} Path to a temporary wav file
 */
function videoToAudioFile(input, sampleRate = 44100) {
	const tempfile = resolve(__dirname, 'temp', 'output.wav');
	if (existsSync(tempfile)) unlinkSync(tempfile);
	execSync(`${ffmpeg} -i "${input}" -ac 1 -ar ${sampleRate} -vn "${tempfile}"`, {stdio: 'pipe'});
	return tempfile;
}

/**
 * Reads a wav file into memory, and optionally deletes the file
 * @param {string} input Input Filename
 * @param {boolean} remove Delete the input file after loading
 * @returns {binary} Binary file
 */
function fileToWAV(input, remove = false) {
	const wav = readFileSync(input);
	if (remove) unlinkSync(input);
	return wav;
}

/**
 * Turns a binary wave file into an array
 * @param {binary} wav Wave file data
 * @returns {number[]} Array of numbers
 */
function wavToArray(wav) {
	return nodewav.decode(wav).channelData[0];
}

/**
 * Loads a wav file from disk and converts it to an array
 * @param {string} input Filename
 * @param {boolean} remove Delete the input file after loading
 * @returns {number[]} Wav file as an array
 */
function wavFileToArray(input, remove) {
	const wav = fileToWAV(input, remove);
	return wavToArray(wav);
}

/**
 * Loads the audio from a media file into a wav array
 * @param {string} filename The path to the media file
 * @param {number} sampleRate The sample rate of the output wav file
 * @returns {number[]} Wav file as an array
 */
function fileToArray(filename, sampleRate) {
	const input = videoToAudioFile(filename, sampleRate);
	return wavFileToArray(input, true);
}

/**
 *
 * @param {number[]} input Wav array
 * @param {number} sampleRate The sample rate of the output wav file
 * @returns {binary} Wav binary
 */
function arrayToWAV(input, sampleRate) {
	return nodewav.encode(input, {sampleRate, float: true, bitDepth: 32});
}

/**
 *
 * @param {binary} wav Wav binary
 * @param {string} output Filename
 * @returns {string} Output file path
 */
function wavToFile(wav, output) {
	output = resolve(output);
	if (!output.toLowerCase().endsWith('.wav')) output += '.wav';
	writeFileSync(output, wav);
	return output;
}

/**
 *
 * @param {number[]} input Wav array
 * @param {number} sampleRate The sample rate of the output wav file
 * @param {string} output Filename
 * @returns {string} Output file path
 */
function arrayToFile(input, sampleRate, output) {
	const wav = arrayToWAV(input, sampleRate);
	return wavToFile(wav, output);
}

module.exports = {
	load: fileToArray,
	save: arrayToFile,
};
