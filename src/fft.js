const ft = require('fourier-transform'); // /asm
var applyWindow = require('window-function/apply');

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

function fft(wav, window) {
	if (window) wav = applyWindow(wav, require('window-function/' + window));
	return ft(wav);
}

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
