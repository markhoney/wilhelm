const ft = require('fourier-transform'); // /asm
var applyWindow = require('window-function/apply');

/**
 * Takes a wav file and slices it into overlapping chunks
 * @param {number[]} wav A wav file, as an array of numbers
 * @param {number} size How large the slice is. Must be a power of 2
 * @param {number} step How far to move along the wave file for each slice
 * @callback callback An optional function to call on every slice
 * @returns {array[]} An array of short slices of the wav file, each an array of numbers
 */
function slice(wav, size = 8192, step = 4410, callback = null) {
	const slices = [];
	let start = 0;
	while (start + size < wav.length) {
		let slice = wav.slice(start, start + size);
		if (callback) callback(slice, start);
		else slices.push(slice);
		start += step;
	}
	return slices.length && slices;
}

/**
 * Converts a wav into a fourier transform
 * @param {number[]} wav A short wav file as an array of numbers
 * @param {string} window The name of a window function
 * @returns {number[]} A fourier transform of the wav, as an array of amplitudes
 */
function fft(wav, window) {
	if (window) wav = applyWindow(wav, require('window-function/' + window));
	return ft(wav);
}

/**
 * Converts a wave file into a series of overlapping fourier transforms
 * @param {*} wav A wav file
 * @param {Object} config A set of config values for slice size, step increments, window function and whether to normalise the volume
 * @callback callback An optional function to run on each FFT chunk
 * @returns {array[]} An array of slices
 */
function stft(wav, {size, step, window, normalise} = {}, callback = null) {
	const stft = [];
	slice(wav, size, step, (slice, index) => {
		const fftSlice = Array.from(fft(slice, window));
		if (callback) callback(fftSlice);
		else stft.push(fftSlice);
	});
	if (stft.length && normalise) {
		const factor = 1 / Math.max(...stft.flat());
		for (const index of stft.keys()) {
			stft[index] = stft[index].map((freq) => freq * factor);
		}
	}
	return stft.length && stft;
}

module.exports = {slice, fft, stft};
