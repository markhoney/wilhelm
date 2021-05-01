const ft = require('fourier-transform');
var applyWindow = require('window-function/apply');

function fft(wav, window) {
	if (window) wav = applyWindow(wav, require('window-function/' + window));
	return ft(wav);
}

function stft(wav, frame, start = 0, length = 9999999) {
	let count = 0;
	const slices = [];
	while (start + frame.size < wav.length && count < length) {
		let slice = wav.slice(start, start + frame.size);
		const time = Math.floor(start * 1000 / frame.rate);
		const transform = fft(slice, frame.window);
		slices.push(...prints);
		start += frame.step;
		count++;
	}
	return slices;
}

function print(wav, config) {
	const slices = stft(wav, config.sample);
	const fingerprint = [];
	for (const slice of slices) {
		let prints;
		if (config.frame.mode === 'peaks') prints = peaks(slice, config.print.magnitude);
		else /* if (config.frame.mode === 'bands') */ prints = bands(slice, config.print.magnitude);
		prints = prints.map((band) => [time, Math.round(band[0] * config.sample.rate / (config.frame.size * 2)), band[1]]);
		fingerprint.push(...prints);
	}
	return fingerprint;
}

module.exports = {fft, stft, print};
