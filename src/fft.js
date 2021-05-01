const ft = require('fourier-transform');
var applyWindow = require('window-function/apply');
const peaks = require('./peaks');
const bands = require('./bands');

function fft(wav, window) {
	if (window) wav = applyWindow(wav, require('window-function/' + window));
	return ft(wav);
}

function stft(wav, analyse, start = 0, length = 9999999) {
	let count = 0;
	const slices = [];
	while (start + analyse.size < wav.length && count < length) {
		let slice = wav.slice(start, start + analyse.size);
		const time = Math.floor(start * 1000 / analyse.rate);
		const transform = fft(slice, analyse.window);
		slices.push(...prints);
		start += analyse.step;
		count++;
	}
	return slices;
}

function print(wav, config) {
	const slices = stft(wav, config.sample);
	const fingerprint = [];
	for (const slice of slices) {
		let prints;
		if (config.analyse.mode === 'peaks') prints = peaks(slice, config.print.magnitude);
		else /* if (config.analyse.mode === 'bands') */ prints = bands(slice, config.print.magnitude);
		prints = prints.map((band) => [time, Math.round(band[0] * config.sample.rate / (config.analyse.size * 2)), band[1]]);
		fingerprint.push(...prints);
	}
	return fingerprint;
}



module.exports = {fft, stft, print};
