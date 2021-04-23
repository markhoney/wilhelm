const ft = require('fourier-transform');
var applyWindow = require('window-function/apply');

function fft(wav, window) {
	if (window) wav = applyWindow(wav, require('window-function/' + window));
	return ft(wav);
}

function stft(wav, config, start = 0, length = 9999999) {
	let count = 0;
	const slices = [];
	while (start + config.size < wav.length && count < length) {
		let slice = wav.slice(start, start + config.size);
		const time = Math.floor(start * 1000 / config.rate);
		const transform = fft(slice, config.window);
		slices.push(...prints);
		start += config.step;
		count++;
	}
	return slices;
}

module.exports = {fft, stft};
